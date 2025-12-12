
import React, { useState, useEffect, useRef } from 'react';
import { Plane, Calendar, MapPin, Sparkles, Luggage, CloudSun, CheckSquare, Square, ShoppingBag, ExternalLink, Music, Upload, Grid, X, CheckCircle2, Pencil, Check, RotateCcw, Cloud, Search } from 'lucide-react';
import { useCloset } from '../hooks/useCloset';
import { generatePackingList, generateTripInspiration } from '../services/geminiService';
import { TravelPackingList, VibeMood, ClosetItem, Category } from '../types';
import { useGlobalState } from '../GlobalContext';

const VIBES: VibeMood[] = ['Sophisticated', 'Coquette Cute', 'Edgy/Street', 'Comfy Chic'];
const CATEGORIES: Category[] = ['Top', 'Bottom', 'Dress', 'Outerwear', 'Shoes', 'Bag', 'Accessory'];

const TravelPacker: React.FC = () => {
  const { closetItems } = useCloset();
  const { travelPacker, setTravelPacker } = useGlobalState();
  
  // Destructure global state
  const { destination, duration, tripType, selectedVibe, files, selectedClosetIds, result, selectedItems, packingMode } = travelPacker;

  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Closet Selection State
  const [isClosetModalOpen, setIsClosetModalOpen] = useState(false);
  const [modalCategoryFilter, setModalCategoryFilter] = useState<Category | 'All'>('All');
  
  // Local state for editing Titles
  const [editingDayIndex, setEditingDayIndex] = useState<number | null>(null);
  const [editedTitle, setEditedTitle] = useState('');

  // Helper to update global state
  const updateState = (updates: Partial<typeof travelPacker>) => {
    setTravelPacker(prev => ({ ...prev, ...updates }));
  };

  // Helper to update selection set
  const setSelectedItems = (newSet: Set<string>) => {
    updateState({ selectedItems: newSet });
  };

  const handleResetTrip = () => {
    if (window.confirm("Start a new trip plan? This will clear current details.")) {
        setTravelPacker({
            destination: '',
            duration: '',
            tripType: 'Leisure',
            selectedVibe: 'Sophisticated',
            files: [],
            selectedClosetIds: [],
            result: null,
            selectedItems: new Set<string>(),
            packingMode: 'closet'
        });
    }
  };

  // Auto-select all items when result is loaded (only if empty)
  useEffect(() => {
    if (result && result.outfits_per_day && selectedItems.size === 0) {
      const allKeys = new Set<string>();
      result.outfits_per_day.forEach((day, dIdx) => {
        if (day.items) {
          day.items.forEach((_, iIdx) => {
            allKeys.add(`${dIdx}-${iIdx}`);
          });
        }
      });
      setSelectedItems(allKeys);
    }
  }, [result]);

  const handlePack = async () => {
    if (!destination || !duration) return;
    
    setIsLoading(true);
    updateState({ result: null });

    try {
      let data: TravelPackingList;

      // DEMO MODE CHECK: Instant Inspiration for "Paris"
      if (packingMode === 'inspiration' && destination.toLowerCase().trim() === 'paris') {
         await new Promise(resolve => setTimeout(resolve, 150)); // Tiny realistic delay
         
         data = {
            destination_vibe: "Parisian Chic",
            weather_forecast_guess: "Sunny 18°C",
            weather_reasoning: "Perfect spring weather for strolling along the Seine. Light layers recommended.",
            outfits_per_day: [
              {
                day: 1,
                activity: "Café de Flore & Le Marais Shopping",
                creative_title: "Effortless Rive Gauche",
                vibe_playlist: "La Vie En Rose - Edith Piaf",
                items: [
                  {
                    name: "Classic Beige Trench",
                    category: "Outerwear",
                    is_owned: false,
                    image_url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&q=80"
                  },
                  {
                    name: "Silk Scarf",
                    category: "Accessory",
                    is_owned: false,
                    image_url: "https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?auto=format&fit=crop&w=400&q=80"
                  },
                  {
                    name: "Chic Beret",
                    category: "Accessory",
                    is_owned: false,
                    image_url: "https://images.unsplash.com/photo-1550520920-27ba45c38740?auto=format&fit=crop&w=400&q=80"
                  }
                ],
                styling_note: "Keep it neutral but add texture with silk."
              }
            ]
         };
         
         updateState({ result: data });
         setIsLoading(false);
         return; // Skip normal AI generation
      }

      if (packingMode === 'inspiration') {
         // INSPIRATION MODE (Normal AI)
         data = await generateTripInspiration(destination, duration, tripType, selectedVibe);
      } else {
         // CLOSET MODE
         const selectedClosetItems = closetItems.filter(item => selectedClosetIds.includes(item.id));
         const finalItems: (ClosetItem | File)[] = [...files, ...selectedClosetItems];

         if (finalItems.length === 0) {
           alert("Please upload items or select from your closet to pack!");
           setIsLoading(false);
           return;
         }
         data = await generatePackingList(destination, duration, tripType, finalItems, selectedVibe);
      }

      if (data) {
        updateState({ result: data });
      } else {
        throw new Error("No data returned");
      }
    } catch (e) {
      console.error(e);
      alert("Oops! Could not pack your bags right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelection = (key: string) => {
    const newSet = new Set<string>(selectedItems);
    if (newSet.has(key)) newSet.delete(key);
    else newSet.add(key);
    setSelectedItems(newSet);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      updateState({ files: [...files, ...Array.from(e.target.files!)] });
    }
  };

  const removeFile = (idx: number) => {
    updateState({ files: files.filter((_, i) => i !== idx) });
  };

  const toggleClosetItem = (id: string) => {
    updateState({
      selectedClosetIds: selectedClosetIds.includes(id) 
        ? selectedClosetIds.filter(i => i !== id) 
        : [...selectedClosetIds, id]
    });
  };

  // Helper to map result "id" back to image source
  const getItemImage = (indexStr: string | null | undefined) => {
    if (!indexStr || packingMode === 'inspiration') return null; // No user images in inspiration mode
    const index = parseInt(indexStr);
    if (isNaN(index)) return null;

    if (index < files.length) {
      return URL.createObjectURL(files[index]);
    } else {
      const closetIndex = index - files.length;
      const selectedClosetItems = closetItems.filter(item => selectedClosetIds.includes(item.id));
      return selectedClosetItems[closetIndex]?.image;
    }
  };

  const handleShopList = () => {
    // Only for Closet Mode checkouts
    if (!result || !result.outfits_per_day) return;
    const unownedQueries: string[] = [];
    result.outfits_per_day.forEach((day, dIdx) => {
      if (day.items) {
        day.items.forEach((item, iIdx) => {
          const key = `${dIdx}-${iIdx}`;
          if (selectedItems.has(key) && !item.is_owned) {
            unownedQueries.push(item.name);
          }
        });
      }
    });

    if (unownedQueries.length > 0) {
      const query = encodeURIComponent(`buy ${unownedQueries.slice(0, 3).join(' ')} style for ${destination}`);
      window.open(`https://www.google.com/search?q=${query}&tbm=shop`, '_blank');
    } else {
      alert("You own everything selected, darling! You are ready to go.");
    }
  };

  const handleShopIndividualItem = (itemName: string) => {
     const query = encodeURIComponent(`buy ${itemName} ${selectedVibe} style`);
     window.open(`https://www.google.com/search?q=${query}&tbm=shop`, '_blank');
  };

  const saveTitleEdit = (dayIndex: number) => {
    if (!result) return;
    const newOutfits = [...result.outfits_per_day];
    newOutfits[dayIndex].creative_title = editedTitle;
    updateState({ result: { ...result, outfits_per_day: newOutfits } });
    setEditingDayIndex(null);
  };

  const startTitleEdit = (dayIndex: number, currentTitle: string) => {
    setEditingDayIndex(dayIndex);
    setEditedTitle(currentTitle);
  };

  const filteredClosetItems = modalCategoryFilter === 'All' 
    ? closetItems 
    : closetItems.filter(item => item.category === modalCategoryFilter);

  const totalItems = result?.outfits_per_day?.reduce((acc, day) => acc + (day.items?.length || 0), 0) || 0;
  const selectedCount = selectedItems.size;

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fade-in pb-32">
      
      {/* Header */}
      <div className="text-center relative py-8 group">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white rounded-full blur-3xl -z-10 opacity-60"></div>
        <h2 className="text-6xl font-serif text-coquette-900 mb-2 drop-shadow-sm">Bon Voyage</h2>
        <p className="text-coquette-600 font-sans tracking-wide bg-white/60 inline-block px-4 py-1 rounded-full backdrop-blur-sm">Pack light, travel chic. Let's curate your suitcase.</p>
        
        {/* Reset Button (Top Right Absolute) */}
        <button 
           onClick={handleResetTrip}
           className="absolute top-0 right-0 md:top-8 md:right-8 bg-white text-coquette-400 p-2 rounded-full shadow-sm hover:text-red-500 hover:shadow-md transition-all"
           title="Start New Trip"
        >
           <RotateCcw size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left: Input Card (Journal Style) */}
        <div className="md:col-span-4 space-y-6">
           
           {/* Details Card */}
           <div className={`
              border-2 rounded-[2rem] p-8 shadow-lg relative rotate-1 transition-colors duration-500
              ${packingMode === 'inspiration' ? 'bg-sky-50 border-white' : 'bg-cream border-white'}
           `}>
               {/* Mode Toggle */}
               <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-md border border-coquette-100 p-1 flex items-center z-20">
                  <button 
                    onClick={() => { updateState({ packingMode: 'closet', result: null }); }}
                    className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${packingMode === 'closet' ? 'bg-coquette-600 text-white' : 'text-coquette-400 hover:text-coquette-600'}`}
                  >
                    My Closet
                  </button>
                  <button 
                    onClick={() => { updateState({ packingMode: 'inspiration', result: null }); }}
                    className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${packingMode === 'inspiration' ? 'bg-indigo-400 text-white' : 'text-coquette-400 hover:text-indigo-400'}`}
                  >
                    Inspiration ✨
                  </button>
               </div>

               {/* Tape Decor */}
               <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-coquette-100/50 rotate-[-2deg] backdrop-blur-sm shadow-sm -z-10"></div>

               <div className="space-y-6 mt-2">
                  <div>
                    <label className="flex items-center gap-2 text-[10px] uppercase font-bold text-coquette-500 mb-2 tracking-widest">
                      <MapPin size={12} /> Destination
                    </label>
                    <input 
                      type="text" 
                      value={destination}
                      onChange={(e) => updateState({ destination: e.target.value })}
                      placeholder="e.g. Paris"
                      className="w-full bg-white border border-coquette-200 rounded-xl px-4 py-3 font-serif text-xl focus:outline-none focus:border-coquette-400 text-coquette-900 placeholder-coquette-200"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-[10px] uppercase font-bold text-coquette-500 mb-2 tracking-widest">
                      <Calendar size={12} /> Duration
                    </label>
                    <input 
                      type="number" 
                      value={duration}
                      onChange={(e) => updateState({ duration: e.target.value })}
                      placeholder="3"
                      className="w-full bg-white border border-coquette-200 rounded-xl px-4 py-3 font-serif text-xl focus:outline-none focus:border-coquette-400 text-coquette-900 placeholder-coquette-200"
                    />
                  </div>

                  <div>
                     <label className="flex items-center gap-2 text-[10px] uppercase font-bold text-coquette-500 mb-2 tracking-widest">
                      <Sparkles size={12} /> What's the Mood?
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {VIBES.map(vibe => (
                        <button
                          key={vibe}
                          onClick={() => updateState({ selectedVibe: vibe })}
                          className={`
                            px-2 py-1.5 rounded-xl text-[9px] font-bold uppercase transition-all border-2
                            ${selectedVibe === vibe 
                              ? 'bg-coquette-600 text-white border-coquette-600 shadow-md transform scale-105' 
                              : 'bg-white text-coquette-400 border-white hover:border-coquette-200'}
                          `}
                        >
                          {vibe}
                        </button>
                      ))}
                    </div>
                  </div>
               </div>
           </div>

           {/* Trip Wardrobe Selector - HIDDEN IN INSPIRATION MODE */}
           {packingMode === 'closet' && (
             <div className="bg-white border-2 border-coquette-100 rounded-[2rem] p-6 shadow-sm animate-fade-in">
                <label className="flex items-center gap-2 text-[10px] uppercase font-bold text-coquette-500 mb-4 tracking-widest">
                    <Luggage size={12} /> Trip Wardrobe
                </label>

                <div className="grid grid-cols-2 gap-3 mb-4">
                   <button 
                     onClick={() => fileInputRef.current?.click()}
                     className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-coquette-200 hover:bg-coquette-50 hover:border-coquette-400 transition-colors"
                   >
                      <Upload size={16} className="text-coquette-500 mb-1" />
                      <span className="text-[10px] font-bold text-coquette-800">Upload New</span>
                      <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                   </button>

                   <button 
                     onClick={() => setIsClosetModalOpen(true)}
                     className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-double border-coquette-200 hover:bg-coquette-50 hover:border-coquette-400 transition-colors"
                   >
                      <Grid size={16} className="text-coquette-500 mb-1" />
                      <span className="text-[10px] font-bold text-coquette-800">From Closet</span>
                   </button>
                </div>

                {/* Mini Thumbnails */}
                <div className="flex flex-wrap gap-2">
                   {files.map((f, i) => (
                     <div key={`f-${i}`} className="w-10 h-10 rounded-lg overflow-hidden relative group">
                        <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" />
                        <button onClick={() => removeFile(i)} className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center"><X size={12}/></button>
                     </div>
                   ))}
                   {selectedClosetIds.map(id => {
                     const item = closetItems.find(i => i.id === id);
                     return item ? (
                       <div key={`c-${id}`} className="w-10 h-10 rounded-lg overflow-hidden relative group border border-coquette-200">
                          <img src={item.image} className="w-full h-full object-cover" />
                          <button onClick={() => toggleClosetItem(id)} className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center"><X size={12}/></button>
                       </div>
                     ) : null;
                   })}
                   {(files.length + selectedClosetIds.length === 0) && (
                     <p className="text-xs text-coquette-300 italic w-full text-center py-2">No items selected yet</p>
                   )}
                </div>
             </div>
           )}

           <button
             onClick={handlePack}
             disabled={isLoading || !destination || !duration || (packingMode === 'closet' && files.length + selectedClosetIds.length === 0)}
             className={`w-full py-4 text-white font-serif uppercase tracking-widest text-xs rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 btn-press
               ${packingMode === 'inspiration' ? 'bg-gradient-to-r from-indigo-400 to-purple-400' : 'bg-gradient-to-r from-coquette-400 to-coquette-600'}
             `}
           >
             {isLoading ? (
               <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
             ) : (
               <>
                 <span>{packingMode === 'inspiration' ? '✨' : '🎀'}</span> {packingMode === 'inspiration' ? 'Dream It Up' : 'Pack My Bags'}
               </>
             )}
           </button>

        </div>

        {/* Right: Results (Itinerary Style) */}
        <div className="md:col-span-8">
           {result && result.outfits_per_day ? (
             <div className="space-y-6 animate-fade-up">
                {/* Weather Widget - Postcard Style */}
                <div className={`
                    p-6 rounded-[2rem] border-4 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center gap-6
                    ${packingMode === 'inspiration' ? 'bg-gradient-to-br from-indigo-50 to-white border-indigo-50' : 'bg-white border-coquette-50'}
                `}>
                   <div className="absolute top-0 right-0 p-4 opacity-20">
                      <CloudSun size={100} className={packingMode === 'inspiration' ? 'text-indigo-300' : 'text-coquette-300'} />
                   </div>
                   
                   <div className={`relative z-10 p-4 rounded-2xl border flex-shrink-0 ${packingMode === 'inspiration' ? 'bg-white border-indigo-100' : 'bg-coquette-50 border-coquette-100'}`}>
                      <p className="text-3xl font-serif text-coquette-900 text-center leading-none">{result.weather_forecast_guess?.split(' ')[0] || "Sunny"}</p>
                      <p className="text-xs text-center text-coquette-500 mt-1 uppercase tracking-wider font-bold">Forecast</p>
                   </div>
                   
                   <div className="relative z-10 flex-1">
                      <p className="text-lg font-serif italic text-coquette-800 leading-relaxed">"{result.weather_reasoning}"</p>
                   </div>
                </div>

                {/* Day by Day List */}
                <div className="space-y-6">
                   {result.outfits_per_day.map((day, dIdx) => (
                     <div 
                       key={dIdx} 
                       className={`
                         backdrop-blur-sm p-8 rounded-[3rem] border-2 shadow-sm relative group hover:bg-white transition-colors
                         ${packingMode === 'inspiration' ? 'bg-indigo-50/30 border-white' : 'bg-white/60 border-white'}
                       `}
                     >
                        
                        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-gray-100 pb-4">
                           <div className="flex-1">
                              {editingDayIndex === dIdx ? (
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="text" 
                                    value={editedTitle} 
                                    onChange={(e) => setEditedTitle(e.target.value)}
                                    className="font-serif text-3xl text-coquette-900 bg-white/50 border-b-2 border-coquette-400 focus:outline-none w-full"
                                  />
                                  <button onClick={() => saveTitleEdit(dIdx)} className="text-green-600 hover:text-green-800"><Check size={24} /></button>
                                  <button onClick={() => setEditingDayIndex(null)} className="text-red-400 hover:text-red-600"><X size={24} /></button>
                                </div>
                              ) : (
                                <h4 className="font-serif text-3xl text-coquette-900 flex items-center gap-3 group/title">
                                  {day.creative_title}
                                  <button 
                                    onClick={() => startTitleEdit(dIdx, day.creative_title)}
                                    className="opacity-0 group-hover/title:opacity-100 text-coquette-300 hover:text-coquette-500 transition-opacity"
                                    title="Edit Title"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                </h4>
                              )}
                              <p className="text-xs text-coquette-500 font-bold uppercase tracking-widest mt-1">Day {day.day}: {day.activity}</p>
                           </div>
                           <div className="flex flex-col items-end gap-1">
                             <div className={`px-4 py-2 rounded-full border ${packingMode === 'inspiration' ? 'bg-indigo-50 border-indigo-100 text-indigo-800' : 'bg-coquette-50 border-coquette-100 text-coquette-600'}`}>
                               <p className="text-xs italic flex items-center gap-2">
                                 <Sparkles size={12} /> {day.styling_note}
                               </p>
                             </div>
                             <div className="text-[9px] uppercase font-bold text-coquette-400 flex items-center gap-1">
                               <Music size={10} /> {day.vibe_playlist}
                             </div>
                           </div>
                        </div>

                        {/* Items Checklist / Mood Board Grid */}
                        <div className={`
                            ${packingMode === 'inspiration' ? 'grid grid-cols-2 md:grid-cols-3 gap-4' : 'space-y-3'}
                        `}>
                           {day.items?.map((item, iIdx) => {
                             const key = `${dIdx}-${iIdx}`;
                             const isSelected = selectedItems.has(key);
                             const img = getItemImage(item.id);

                             if (packingMode === 'inspiration') {
                                // INSPIRATION CARD VIEW
                                return (
                                  <div key={key} className="bg-white p-4 rounded-2xl shadow-sm border border-indigo-100 flex flex-col items-center text-center hover:scale-[1.02] transition-transform overflow-hidden">
                                     {/* Render Image if available (Demo Mode), else Emoji */}
                                     {item.image_url ? (
                                        <div className="w-full aspect-square mb-3 rounded-xl overflow-hidden shadow-inner border border-indigo-50">
                                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                     ) : (
                                        <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-2xl mb-3 shadow-inner">
                                            {item.category?.toLowerCase().includes('shoe') ? '👠' : 
                                            item.category?.toLowerCase().includes('bag') ? '👛' : 
                                            item.category?.toLowerCase().includes('access') ? '🧣' : '👗'}
                                        </div>
                                     )}
                                     
                                     <p className="font-serif font-bold text-coquette-900 text-lg leading-tight mb-2">{item.name}</p>
                                     <button 
                                       onClick={() => handleShopIndividualItem(item.name)}
                                       className="mt-auto text-[9px] uppercase font-bold text-white bg-indigo-400 px-3 py-1.5 rounded-full hover:bg-indigo-600 transition-colors flex items-center gap-1"
                                     >
                                        <Search size={10} /> Shop Look
                                     </button>
                                  </div>
                                )
                             }

                             // STANDARD CHECKLIST VIEW
                             return (
                               <div 
                                 key={key} 
                                 onClick={() => toggleSelection(key)}
                                 className={`
                                   flex items-center gap-4 p-3 rounded-2xl border-2 transition-all cursor-pointer group/item
                                   ${isSelected ? 'bg-white border-coquette-200 shadow-sm' : 'bg-transparent border-transparent hover:bg-white/50 hover:border-white'}
                                 `}
                               >
                                  {/* Checkbox */}
                                  <div className={`transition-transform duration-300 ${isSelected ? 'scale-110 text-coquette-600' : 'text-coquette-300 scale-100'}`}>
                                     {isSelected ? <CheckSquare size={24} weight="fill" /> : <Square size={24} />}
                                  </div>

                                  {/* Image or Placeholder */}
                                  <div className={`w-14 h-14 rounded-xl border border-coquette-100 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-inner relative ${!item.is_owned ? 'bg-coquette-50' : 'bg-white'}`}>
                                     {item.is_owned && img ? (
                                        <img src={img} className="w-full h-full object-cover" />
                                     ) : (
                                        <span className="text-2xl opacity-60">
                                           {item.category?.toLowerCase().includes('shoe') ? '🩰' : 
                                            item.category?.toLowerCase().includes('bag') ? '👛' : '👗'}
                                        </span>
                                     )}
                                  </div>

                                  {/* Text */}
                                  <div className="flex-1">
                                     <p className={`font-serif text-xl leading-none transition-colors ${isSelected ? 'text-coquette-900' : 'text-coquette-300'}`}>
                                       {item.name}
                                     </p>
                                     <div className="flex gap-2 mt-1.5">
                                       {item.is_owned ? (
                                          <span className="text-[9px] font-bold text-coquette-600 bg-coquette-50 px-2 py-0.5 rounded-full uppercase tracking-wider">In Suitcase</span>
                                       ) : (
                                          <span className="text-[9px] font-bold text-white bg-coquette-300 px-2 py-0.5 rounded-full uppercase tracking-wider">Need to Buy</span>
                                       )}
                                     </div>
                                  </div>
                               </div>
                             );
                           })}
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           ) : (
             <div className={`
                h-full min-h-[500px] border-4 border-dotted rounded-[3rem] flex flex-col items-center justify-center p-12 text-center transition-colors
                ${packingMode === 'inspiration' ? 'border-indigo-200 bg-indigo-50/40 text-indigo-400' : 'border-coquette-200 bg-white/40 text-coquette-400'}
             `}>
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-sm animate-float ${packingMode === 'inspiration' ? 'bg-indigo-50' : 'bg-white'}`}>
                  {packingMode === 'inspiration' ? <Cloud size={48} className="text-indigo-300" /> : <Luggage size={48} strokeWidth={1} className="text-coquette-300" />}
                </div>
                <p className="font-serif text-3xl mb-2 text-coquette-800">{packingMode === 'inspiration' ? 'Dreaming of a Getaway?' : 'Ready for takeoff?'}</p>
                <p className="text-sm font-sans max-w-xs mx-auto">
                   {packingMode === 'inspiration' 
                      ? "Let AI curate a complete dream wardrobe for your destination. No packing required."
                      : "Upload trip outfits and enter details to generate your day-by-day itinerary."}
                </p>
             </div>
           )}
        </div>
      </div>

      {/* Closet Selection Modal */}
      {isClosetModalOpen && (
        <div className="fixed inset-0 bg-coquette-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl h-[85vh] rounded-[3rem] shadow-2xl flex flex-col border-[6px] border-white animate-fade-in relative overflow-hidden">
             {/* Header */}
             <div className="p-8 border-b border-coquette-100 bg-coquette-50/50 flex flex-col gap-4">
               <div className="flex justify-between items-center">
                 <div>
                    <h3 className="font-serif text-3xl text-coquette-900">Pack from Closet</h3>
                    <p className="text-coquette-500 text-sm">Select items you want to bring on this trip.</p>
                 </div>
                 <button onClick={() => setIsClosetModalOpen(false)} className="text-coquette-400 hover:text-coquette-800 bg-white p-2 rounded-full shadow-sm"><X size={20} /></button>
               </div>
               
               {/* Categories Filter */}
               <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  <button 
                    onClick={() => setModalCategoryFilter('All')}
                    className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold transition-all ${modalCategoryFilter === 'All' ? 'bg-coquette-600 text-white shadow-md' : 'bg-white border border-coquette-100 text-coquette-400 hover:bg-coquette-50'}`}
                  >
                    All Items
                  </button>
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setModalCategoryFilter(cat)}
                      className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold transition-all ${modalCategoryFilter === cat ? 'bg-coquette-600 text-white shadow-md' : 'bg-white border border-coquette-100 text-coquette-400 hover:bg-coquette-50'}`}
                    >
                      {cat}
                    </button>
                  ))}
               </div>
             </div>

             {/* Grid */}
             <div className="flex-1 overflow-y-auto p-8 bg-lace">
                {closetItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-coquette-400">
                    <ShoppingBag size={48} className="mb-4 opacity-50" />
                    <p className="font-serif text-xl">Your Digital Closet is empty.</p>
                  </div>
                ) : filteredClosetItems.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center text-coquette-400">
                    <Grid size={32} className="mb-4 opacity-50" />
                    <p className="font-serif text-lg">No items in this category.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredClosetItems.map(item => {
                      const isSelected = selectedClosetIds.includes(item.id);
                      return (
                        <div 
                          key={item.id}
                          onClick={() => toggleClosetItem(item.id)}
                          className={`
                            relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border-2 group shadow-sm
                            ${isSelected ? 'border-coquette-600 ring-4 ring-coquette-200 transform scale-95' : 'border-white hover:border-coquette-300 hover:shadow-lg hover:-translate-y-1'}
                          `}
                        >
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          <div className={`absolute inset-0 bg-coquette-900/10 transition-opacity ${isSelected ? 'opacity-20' : 'opacity-0 hover:opacity-10'}`} />
                          
                          {/* Selection Indicator */}
                          <div className={`absolute top-2 right-2 transition-transform duration-300 ${isSelected ? 'scale-100' : 'scale-0'}`}>
                            <div className="bg-coquette-600 text-white rounded-full p-1 shadow-md">
                              <CheckCircle2 size={16} />
                            </div>
                          </div>
                          
                          <div className="absolute bottom-0 left-0 right-0 bg-white/95 p-2 text-center backdrop-blur-sm">
                            <p className="text-[10px] font-bold text-coquette-900 truncate uppercase tracking-wider">{item.name}</p>
                            <p className="text-[9px] text-coquette-500">{item.category}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
             </div>
             
             {/* Footer */}
             <div className="p-6 border-t border-coquette-100 bg-white flex justify-between items-center shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
               <div>
                  <span className="text-coquette-600 text-sm font-bold">{selectedClosetIds.length} items selected</span>
               </div>
               <button 
                onClick={() => setIsClosetModalOpen(false)}
                className="bg-coquette-600 text-white px-8 py-3 rounded-full font-serif text-lg hover:bg-coquette-800 transition-colors shadow-lg shadow-coquette-200 btn-press"
               >
                 Done
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Floating Action Bar - Closet Mode Only */}
      {result && result.outfits_per_day && packingMode === 'closet' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white border-2 border-coquette-100 shadow-[0_10px_40px_rgba(0,0,0,0.1)] rounded-full px-8 py-3 flex items-center gap-8 z-50 animate-fade-up">
           <div className="text-center">
              <p className="text-[8px] uppercase font-bold text-coquette-400 tracking-widest mb-1">Items Selected</p>
              <p className="font-serif text-2xl text-coquette-900 leading-none">{selectedCount} <span className="text-coquette-300 text-lg">/ {totalItems}</span></p>
           </div>
           
           <div className="h-8 w-px bg-coquette-100"></div>

           <button 
             onClick={handleShopList}
             className="flex items-center gap-2 bg-coquette-900 text-white px-6 py-3 rounded-full hover:bg-coquette-800 transition-colors shadow-lg btn-press"
           >
             <ShoppingBag size={16} />
             <span className="text-xs font-bold uppercase tracking-wider">Shop Missing</span>
             <ExternalLink size={12} className="opacity-50" />
           </button>
        </div>
      )}
    </div>
  );
};

export default TravelPacker;
