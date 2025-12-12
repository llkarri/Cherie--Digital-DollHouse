
export interface LuxuryRecommendation {
  name: string;
  brand: string;
  price_estimate: string;
  visual_description: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  recommendations?: LuxuryRecommendation[];
}

export type Section = 'closet' | 'digital-closet' | 'shopping-guide' | 'body' | 'luxury' | 'travel' | 'dressing-room' | 'thrift' | 'planner' | 'profile';

export interface ChatState {
  history: Message[];
  isLoading: boolean;
}

// Closet & Finance Types
export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter' | 'Year-Round';
export type Category = 'Top' | 'Bottom' | 'Dress' | 'Outerwear' | 'Shoes' | 'Bag' | 'Accessory';
export type VibeMood = 'Sophisticated' | 'Coquette Cute' | 'Edgy/Street' | 'Comfy Chic';

export interface ClosetItem {
  id: string;
  image: string; // Base64 string
  name: string;
  category: Category;
  season: Season;
  price: number;
  dateAdded: number;
  timesWorn: number;
  color?: string; // New: For Auto-tagging
}

export type ThriftCollection = 'Old Money' | 'Princess Core' | 'Downtown Doll' | 'Vintage Heirlooms';

export interface ThriftItem {
  id: string;
  image: string;
  name: string;
  price: number;
  size: string;
  condition: string;
  university: string;
  dateListed: number;
  description: string;
  collection: ThriftCollection;
}

export interface WishlistItem {
  id: string;
  name: string;
  season: Season;
  isPurchased: boolean;
}

// Unified Item for Hybrid Generation (Real + Generic)
export interface HybridItem {
  id?: string; // Present if owned
  name: string;
  category: string; // Top, Bottom, Shoes, etc.
  is_owned: boolean;
  visual_description?: string; // For generic items, describe visual for icon generation.
  image_url?: string; // For Inspiration/Demo Mode
}

export interface Outfit {
  creative_title: string; // "Midnight in Paris"
  vibe_playlist: string; // "Song by Artist"
  items: HybridItem[]; // Mixture of owned and generic
  styling_tip: string;
  manicure_suggestion: string;
}

export interface ClosetAnalysisResult {
  outfits: Outfit[];
}

export interface StyleRecommendation {
  category: string;
  style_name: string;
  reasoning: string;
  visual_search_term: string;
}

export interface BodyFitAnalysisResult {
  body_shape: string;
  analysis: string;
  recommendations: StyleRecommendation[];
}

export interface TravelPackingList {
  destination_vibe: string;
  weather_forecast_guess: string;
  weather_reasoning: string;
  outfits_per_day: {
    day: number;
    activity: string;
    creative_title: string;
    vibe_playlist: string;
    items: HybridItem[];
    styling_note: string;
  }[];
}

export interface OutfitRating {
  score: number;
  comment: string;
  is_complete: boolean;
  missing_item_suggestion?: string;
}

// Planner Types
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface PlannerEntry {
  day: DayOfWeek;
  outfitIds: string[]; // IDs of ClosetItems
}

// User Profile Types
export interface UserProfile {
  name: string;
  styleGoal: string; // e.g., "Minimalist", "Vintage"
  sizes: {
    top: string;
    bottom: string;
    shoe: string;
  };
}
