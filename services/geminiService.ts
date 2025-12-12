
import { GoogleGenAI, Type } from "@google/genai";
import { ClosetAnalysisResult, BodyFitAnalysisResult, Message, LuxuryRecommendation, ClosetItem, TravelPackingList, VibeMood, OutfitRating, Category, Season } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert File to Gemini Part
const fileToPart = async (file: File) => {
  return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper to convert Data URL (string) to Gemini Part
const stringToPart = (dataUrl: string) => {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches || matches.length < 3) {
    throw new Error("Invalid image data");
  }
  return {
    inlineData: {
      mimeType: matches[1],
      data: matches[2]
    }
  };
};

// New Function: Auto-tag item from image
export const autoTagImage = async (base64Image: string): Promise<{ name: string; category: Category; season: Season; color: string; estimatedPrice: number }> => {
  try {
    const imagePart = stringToPart(base64Image);
    const prompt = `
      Analyze this fashion item image.
      
      Tasks:
      1. Identify the Item Name (be specific, e.g., "Floral Silk Midi Skirt").
      2. Categorize it strictly into one of: 'Top', 'Bottom', 'Dress', 'Outerwear', 'Shoes', 'Bag', 'Accessory'.
      3. Identify the best Season: 'Spring', 'Summer', 'Autumn', 'Winter', 'Year-Round'.
      4. Identify the primary Color.
      5. Estimate a resale price (number only) in USD.
      
      CRITICAL: Return strict JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [imagePart, { text: prompt }],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            category: { type: Type.STRING },
            season: { type: Type.STRING },
            color: { type: Type.STRING },
            estimatedPrice: { type: Type.NUMBER }
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      // Validate enums locally to be safe, defaulting if model hallucinates a new type
      const validCategories: Category[] = ['Top', 'Bottom', 'Dress', 'Outerwear', 'Shoes', 'Bag', 'Accessory'];
      const validSeasons: Season[] = ['Spring', 'Summer', 'Autumn', 'Winter', 'Year-Round'];

      return {
        name: data.name || "New Item",
        category: validCategories.includes(data.category) ? data.category : 'Top',
        season: validSeasons.includes(data.season) ? data.season : 'Year-Round',
        color: data.color || "Multi",
        estimatedPrice: data.estimatedPrice || 0
      };
    }
    throw new Error("Failed to auto-tag image");
  } catch (error) {
    console.error("Auto-tagging failed", error);
    // Return fallback data so the app doesn't crash
    return {
       name: "",
       category: "Top",
       season: "Year-Round",
       color: "",
       estimatedPrice: 0
    };
  }
};

export const analyzeCloset = async (
  items: (File | string)[], 
  userContext: string, 
  userHeight: string = "Average Height",
  vibeMood: VibeMood = "Coquette Cute"
): Promise<ClosetAnalysisResult> => {
  try {
    // Process all items (Files or Data URLs) into Gemini parts
    const imageParts = await Promise.all(items.map(async (item) => {
      if (item instanceof File) {
        return await fileToPart(item);
      } else {
        return stringToPart(item);
      }
    }));
    
    // Explicitly mapping indices for the model
    const fileMappingContext = items.map((_, i) => `Image Index ${i}`).join(', ');

    const prompt = `
      I have provided ${items.length} images of items from my closet.
      Ordering: ${fileMappingContext}.
      
      User Context: Height "${userHeight}", Request "${userContext}", Vibe "${vibeMood}".
      
      Tasks:
      1. Create exactly 3 distinct full outfits (Flat Lay style).
      2. Use provided items if they fit the vibe.
      3. Suggest "Generic Stylist Pick" (is_owned: false) if missing a key piece.
      4. Give "creative_title", "vibe_playlist", styling tip, manicure suggestion.
      
      CRITICAL: Be extremely concise. Return strict JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [...imageParts, { text: prompt }],
      },
      config: {
        systemInstruction: "You are a high-fashion personal stylist. Create outfits.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            outfits: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  creative_title: { type: Type.STRING },
                  vibe_playlist: { type: Type.STRING },
                  items: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING, description: "Index as string (e.g. '0'). Null if generic." },
                        name: { type: Type.STRING },
                        category: { type: Type.STRING },
                        is_owned: { type: Type.BOOLEAN },
                        visual_description: { type: Type.STRING }
                      }
                    }
                  },
                  styling_tip: { type: Type.STRING },
                  manicure_suggestion: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ClosetAnalysisResult;
    }
    throw new Error("Empty response");
  } catch (error) {
    console.error("Closet analysis failed", error);
    throw error;
  }
};

export const analyzeBodyFit = async (file: File | null, description: string): Promise<BodyFitAnalysisResult> => {
  try {
    const parts: any[] = [];
    
    // Add image first if available
    if (file) {
      const imagePart = await fileToPart(file);
      parts.push(imagePart);
    }
    
    // Add text prompt
    parts.push({ text: `
      User Description: "${description}"
      Task: Analyze the silhouette and fit requirements.
      Provide 3 specific fashion recommendations (e.g. specific cuts, styles) that would be flattering.
      Output format: JSON.
    `});

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: parts },
      config: {
        systemInstruction: "You are an expert fashion tailor and stylist. Analyze silhouettes and offer confidence-boosting advice. Be concise.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            body_shape: { type: Type.STRING },
            analysis: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  style_name: { type: Type.STRING },
                  reasoning: { type: Type.STRING },
                  visual_search_term: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) return JSON.parse(response.text) as BodyFitAnalysisResult;
    throw new Error("Empty response from model");
  } catch (error) {
    console.error("Body analysis failed", error);
    throw error;
  }
};

export const chatLuxury = async (
  history: Message[], 
  message: string, 
  budgetLevel: number,
  userAge: string,
  userSize: string
): Promise<{ text: string, recommendations?: LuxuryRecommendation[] }> => {
  try {
    const budgetMap = ["Accessible (Under $500)", "Investment (Under $2000)", "Dream/Couture ($2000+)"];
    const budgetContext = budgetMap[budgetLevel] || "No Budget Limit";

    const systemInstruction = `
      You are a luxury fashion investment consultant with a "Coquette" aesthetic.
      User: Age ${userAge}, Size ${userSize}, Budget ${budgetContext}.
      Provide warm, feminine advice and specific product recommendations.
      CRITICAL: Be extremely concise. Return JSON data immediately.
    `;

    const contents = history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    }));
    contents.push({ role: 'user', parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            response_text: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  brand: { type: Type.STRING },
                  price_estimate: { type: Type.STRING },
                  visual_description: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      return { text: parsed.response_text, recommendations: parsed.recommendations };
    }
    return { text: "I am unable to advise at this moment, darling." };
  } catch (error) {
    console.error("Chat failed", error);
    throw error;
  }
};

export const generatePackingList = async (
  destination: string,
  duration: string,
  tripType: string,
  items: (ClosetItem | File)[],
  vibeMood: VibeMood
): Promise<TravelPackingList> => {
  try {
    const imageParts = await Promise.all(items.map(async (item) => {
      if (item instanceof File) {
        return await fileToPart(item);
      } else {
        return stringToPart(item.image);
      }
    }));

    // Safety clamp: if user asks for > 5 days, just do 5 days to save tokens/prevent errors
    const days = parseInt(duration) || 3;
    const effectiveDays = Math.min(days, 5);

    const wardrobeContext = items.map((item, index) => {
      if (item instanceof File) {
        return `Index ${index}: Uploaded Item`;
      } else {
        return `Index ${index}: ${item.name} (${item.category})`;
      }
    }).join('\n');

    const prompt = `
      Destination: ${destination}, Trip: ${days} days, Type: ${tripType}, Vibe: "${vibeMood}"
      
      Wardrobe (refer by Index):
      ${wardrobeContext}
      
      Tasks:
      1. Predict weather.
      2. Create Day-by-Day itinerary for **${effectiveDays} days max**.
      3. Use provided images (indices). Suggest generic if needed.
      
      CRITICAL: Return strict JSON. Be concise.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: [...imageParts, { text: prompt }] },
      config: {
        systemInstruction: "You are a travel stylist. Create concise packing lists.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            destination_vibe: { type: Type.STRING },
            weather_forecast_guess: { type: Type.STRING },
            weather_reasoning: { type: Type.STRING },
            outfits_per_day: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.INTEGER },
                  activity: { type: Type.STRING },
                  creative_title: { type: Type.STRING },
                  vibe_playlist: { type: Type.STRING },
                  items: { 
                    type: Type.ARRAY, 
                    items: { 
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING, nullable: true },
                        name: { type: Type.STRING },
                        category: { type: Type.STRING },
                        is_owned: { type: Type.BOOLEAN }
                      }
                    } 
                  },
                  styling_note: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) return JSON.parse(response.text) as TravelPackingList;
    throw new Error("Failed to generate packing list");
  } catch (error) {
    console.error("Travel packing failed", error);
    throw error;
  }
}

// New Function for Pure Inspiration Mode
export const generateTripInspiration = async (
  destination: string,
  duration: string,
  tripType: string,
  vibeMood: VibeMood
): Promise<TravelPackingList> => {
  try {
    // Safety clamp for duration to prevent token overflow/hallucination loops
    const days = parseInt(duration) || 3;
    const effectiveDays = Math.min(days, 5); // Cap at 5 days for inspiration

    const prompt = `
      Generate an "Inspiration Packing List" (Mood Board) for a ${days}-day trip to ${destination}.
      Trip Type: ${tripType}, Vibe: "${vibeMood}".
      
      Constraints:
      1. Ignore user wardrobe. Invent specific fashion items (e.g. "Vintage Chanel Bag", "Silk Scarf").
      2. Set 'is_owned' to FALSE for all items.
      3. Create a Day-by-Day itinerary for ${effectiveDays} representative days only.
      4. **CRITICAL**: Do not generate generic descriptions. Keep item names short (max 5 words).
      5. **CRITICAL**: Prevent infinite loops. Return strictly valid JSON.
      
      Output Schema matches the TravelPackingList type.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        systemInstruction: "You are a concise travel fashion editor. Return valid JSON only. Do not repeat text.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            destination_vibe: { type: Type.STRING },
            weather_forecast_guess: { type: Type.STRING },
            weather_reasoning: { type: Type.STRING },
            outfits_per_day: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.INTEGER },
                  activity: { type: Type.STRING },
                  creative_title: { type: Type.STRING },
                  vibe_playlist: { type: Type.STRING },
                  items: { 
                    type: Type.ARRAY, 
                    items: { 
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING, nullable: true },
                        name: { type: Type.STRING },
                        category: { type: Type.STRING },
                        is_owned: { type: Type.BOOLEAN }
                      }
                    } 
                  },
                  styling_note: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) return JSON.parse(response.text) as TravelPackingList;
    throw new Error("Failed to generate inspiration list");
  } catch (error) {
    console.error("Inspiration generation failed", error);
    throw error;
  }
}

export const rateOutfit = async (items: ClosetItem[]): Promise<OutfitRating> => {
  try {
    const imageParts = items.map(item => stringToPart(item.image));
    
    const prompt = `
      Rate this outfit (images provided).
      
      Tasks:
      1. Score 1-10.
      2. Cute "Coquette" comment.
      3. Is it complete?
      4. Suggest missing item.
      
      CRITICAL: Return strict JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [...imageParts, { text: prompt }],
      },
      config: {
        systemInstruction: "You are a stylist. Rate outfits.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            comment: { type: Type.STRING },
            is_complete: { type: Type.BOOLEAN },
            missing_item_suggestion: { type: Type.STRING, nullable: true }
          }
        }
      }
    });

    if (response.text) return JSON.parse(response.text) as OutfitRating;
    throw new Error("Failed to rate outfit");

  } catch (error) {
    console.error("Rating failed", error);
    throw error;
  }
}
