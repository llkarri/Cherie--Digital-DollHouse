
import React, { useState, useRef } from 'react';
import { Upload, X, Sparkles, ShoppingBag, Hand, Ruler, Heart, Star, Grid, CheckCircle2, Filter, Music, Shuffle } from 'lucide-react';
import { analyzeCloset } from '../services/geminiService';
import { ClosetAnalysisResult, Category, VibeMood } from '../types';
import VoiceInput from './VoiceInput';
import { useCloset } from '../hooks/useCloset';
import { useGlobalState } from '../GlobalContext';

const CATEGORIES: Category[] = ['Top', 'Bottom', 'Dress', 'Outerwear', 'Shoes', 'Bag', 'Accessory'];
const VIBES: VibeMood[] = ['Sophisticated', 'Coquette Cute', 'Edgy/Street', 'Comfy Chic'];

const StyleMyCloset: React.FC = () => {
  const { closetItems } = useCloset();
  const { styleMyCloset, setStyleMyCloset } = useGlobalState();
  
  // Destructure from global state
  const { files, selectedClosetItemIds, context, userHeight, selectedVibe, result } = styleMyCloset;

  const [isClosetModalOpen, setIsClosetModalOpen] = useState(false);
  const [modalCategoryFilter, setModalCategoryFilter] = useState<Category | 'All'>('All');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getSelectedClosetItems = () => closetItems.filter(item => selectedClosetItemIds.includes(item.id));
  const totalItemsCount = files.length + selectedClosetItemIds.length;

  // -- State Updaters --
  const updateState = (updates: Partial<typeof styleMyCloset>) => {
    setStyleMyCloset(prev => ({ ...prev, ...updates }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      updateState({ files: [...files, ...newFiles] });
      setErrorMsg(null);
    }
  };

  const removeFile = (index: number) => {
    updateState({ files: files.filter((_, i) => i !== index) });
  };

  const toggleClosetItem = (id: string) => {
    updateState({
      selectedClosetItemIds: selectedClosetItemIds.includes(id) 
        ? selectedClosetItemIds.filter(i => i !== id) 
        : [...selectedClosetItemIds, id]
    });
  };

  const removeClosetItem = (id: string) => {
    updateState({ selectedClosetItemIds: selectedClosetItemIds.filter(i => i !== id) });
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    updateState({ result: null });
    setErrorMsg(null);
    try {
      const selectedItems = getSelectedClosetItems();
      const payload: (File | string)[] = [
        ...files,
        ...selectedItems.map(item => item.image)
      ];

      const data = await analyzeCloset(payload, context, userHeight, selectedVibe);
      updateState({ result: data });
    } catch (error) {
      setErrorMsg("We encountered an issue styling your closet. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const openShoppingLink = (itemName: string) => {
    const query = encodeURIComponent(`buy ${itemName} ${selectedVibe} style`);
    window.open(`https://www.google.com/search?tbm=shop&q=${query}`, '_blank');
  };

  // Helper to find image for OWNED items
  const getOwnedImage = (indexStr: string | undefined) => {
    if (!indexStr) return null;
    const index = parseInt(indexStr);
    if (isNaN(index)) return null;

    if (index < files.length) {
      return URL.createObjectURL(files[index]);
    } else {
      const closetIndex = index - files.length;
      const items = getSelectedClosetItems();
      return items[closetIndex]?.image;
    }
  };

  // Filter items in modal
  const filteredClosetItems = modalCategoryFilter === 'All' 
    ? closetItems 
    : closetItems.filter(item => item.category === modalCategoryFilter);

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-20">
      {/* Parisian Header Decor */}
      <div className="relative h-48 w-full rounded-b-[4rem] overflow-hidden mb-8 border-b-8 border-double border-white shadow-xl group">
         <img 
           src="https://image.pollinations.ai/prompt/renaissance fresco painting of cherubs and flowers pastel pink and cream soft lighting panoramic?width=1200&height=400&nologo=true" 
           alt="Angels Header"
           className="w-full h-full object-cover opacity-90 animate-pulse-slow scale-105 group-hover:scale-110 transition-transform duration-[10s]"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-coquette-50 via-transparent to-transparent flex items-end justify-center pb-8">
            <h2 className="text-6xl font-serif font-medium text-coquette-900 tracking-wide drop-shadow-sm animate-float">Playhouse Styling</h2>
         </div>
      </div>

      <div className="text-center space-y-2 -mt-10 relative z-10">
        <p className="text-coquette-800 font-serif italic text-2xl max-w-lg mx-auto bg-white/80 backdrop-blur-md px-8 py-6 rounded-3xl border-2 border-white shadow-sm relative">
          <Star size={20} className="absolute -top-3 -left-3 text-coquette-400 fill-coquette-200 animate-twinkle" />
          "Every outfit is a dream waiting to be worn."
          <Star size={20} className="absolute -bottom-3 -right-3 text-coquette-400 fill-coquette-200 animate-twinkle" style={{animationDelay: '1.5s'}} />
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Input */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Height Input */}
          <div className="bg-white p-6 rounded-[2.5rem] border-4 border-dotted border-coquette-200 shadow-sm relative overflow-hidden group hover:border-coquette-300 transition-colors">
             <div className="absolute top-0 right-0 w-20 h-20 bg-coquette-50 rounded-bl-full -z-0 transition-transform group-hover:scale-110"></div>
             <label className="text-xs uppercase tracking-widest text-coquette-400 font-bold mb-2 block flex items-center gap-2">
               <Ruler size={14} /> My Height / Size
             </label>
             <input 
               type="text" 
               value={userHeight}
               onChange={(e) => updateState({ userHeight: e.target.value })}
               className="w-full text-4xl font-serif text-coquette-900 border-b-2 border-coquette-100 pb-2 focus:outline-none focus:border-coquette-400 bg-transparent placeholder-coquette-200"
               placeholder="e.g. 5'3 Petite"
             />
          </div>

          {/* Vibe Selector */}
          <div className="bg-cream/50 p-6 rounded-[2.5rem] border border-coquette-100">
             <label className="text-xs uppercase tracking-widest text-coquette-500 font-bold mb-3 block flex items-center gap-2">
               <Sparkles size={14} /> What's the Mood?
             </label>
             <div className="grid grid-cols-2 gap-2">
               {VIBES.map(vibe => (
                 <button
                   key={vibe}
                   onClick={() => updateState({ selectedVibe: vibe })}
                   className={`
                     py-2 px-1 text-[10px] font-bold uppercase tracking-wider rounded-xl border-2 transition-all
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

          {/* Controls: Upload & Select */}
          <div className="grid grid-cols-2 gap-4">
             {/* Upload Button */}
             <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-[3px] border-dashed border-coquette-200 hover:border-coquette-400 hover:bg-white transition-all duration-300 rounded-[2.5rem] p-4 flex flex-col items-center justify-center cursor-pointer bg-white/50 aspect-square group shadow-sm text-center"
            >
              <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
              <div className="bg-coquette-100 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform relative z-10 pointer-events-none shadow-sm">
                <Upload className="w-6 h-6 text-coquette-600" />
              </div>
              <p className="font-serif text-lg text-coquette-800 relative z-10 pointer-events-none">Upload New</p>
            </div>

            {/* Select from Closet Button */}
            <div 
              onClick={() => setIsClosetModalOpen(true)}
              className="border-[3px] border-double border-coquette-300 hover:border-coquette-500 hover:bg-white transition-all duration-300 rounded-[2.5rem] p-4 flex flex-col items-center justify-center cursor-pointer bg-coquette-50 aspect-square group shadow-sm text-center"
            >
               <div className="bg-white p-4 rounded-full mb-3 group-hover:scale-110 transition-transform relative z-10 pointer-events-none shadow-sm">
                <Grid className="w-6 h-6 text-coquette-600" />
              </div>
              <p className="font-serif text-lg text-coquette-800 relative z-10 pointer-events-none">From Closet</p>
            </div>
          </div>

          {/* Thumbnails */}
          {totalItemsCount > 0 && (
            <div className="bg-white/60 p-4 rounded-[2rem] border border-coquette-100">
               <p className="text-[10px] uppercase tracking-widest text-coquette-400 mb-3 text-center font-bold">Selected Treasures ({totalItemsCount})</p>
               <div className="grid grid-cols-4 gap-2">
                  {files.map((file, idx) => (
                    <div key={`file-${idx}`} className="relative aspect-square group">
                      <img src={URL.createObjectURL(file)} className="w-full h-full object-cover rounded-xl border border-coquette-200" />
                      <button onClick={() => removeFile(idx)} className="absolute -top-1 -right-1 bg-red-50 text-red-400 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                    </div>
                  ))}
                  {getSelectedClosetItems().map((item) => (
                    <div key={`closet-${item.id}`} className="relative aspect-square group">
                      <img src={item.image} className="w-full h-full object-cover rounded-xl border border-coquette-200" />
                      <button onClick={() => removeClosetItem(item.id)} className="absolute -top-1 -right-1 bg-red-50 text-red-400 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* Context Input */}
          <div className="relative">
            <textarea
              value={context}
              onChange={(e) => updateState({ context: e.target.value })}
              placeholder="Tell me about your plans..."
              className="w-full bg-white border border-coquette-200 p-6 focus:outline-none focus:border-coquette-400 focus:ring-4 focus:ring-coquette-50 transition-all font-serif text-lg text-coquette-900 resize-none h-32 placeholder:font-sans placeholder:text-sm placeholder:text-coquette-300 rounded-[2rem] shadow-sm"
            />
            <div className="absolute right-4 bottom-4">
              <VoiceInput onTranscript={(text) => updateState({ context: context + (context ? ' ' : '') + text })} />
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className={`w-full py-5 bg-gradient-to-r from-coquette-400 to-coquette-600 text-white font-serif text-xl tracking-widest rounded-full hover:from-coquette-500 hover:to-coquette-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-lg transform hover:-translate-y-1 relative overflow-hidden btn-press`}
          >
            <div className="relative z-10 flex items-center gap-3 pointer-events-none">
                {isLoading ? (
                <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
                    Curating...
                </>
                ) : (
                <>
                    <Sparkles size={20} className="animate-pulse-fast" />
                    Generate {selectedVibe} Look
                </>
                )}
            </div>
          </button>
        </div>

        {/* Right Column: Visual Output */}
        <div className="lg:col-span-8">
          {errorMsg && (
            <div className="p-4 bg-red-50 text-red-800 text-sm mb-4 border border-red-100 rounded-lg shadow-sm animate-pulse-slow">{errorMsg}</div>
          )}
          
          {result ? (
            <div className="space-y-24 pt-8">
              {result.outfits?.map((outfit, idx) => (
                <div key={idx} className="relative group">
                  
                  {/* Outer Lace/Stitched Border Container */}
                  <div className="absolute inset-0 bg-white rounded-[3.2rem] border-[6px] border-coquette-100 shadow-[0_8px_40px_rgba(255,182,193,0.25)] translate-y-2 translate-x-2 -z-10 animate-pulse-slow"></div>
                  
                  {/* Main Card - Sewing Pattern Style */}
                  <div className="bg-white/95 backdrop-blur-sm border-2 border-dashed border-coquette-300 p-8 rounded-[3rem] relative overflow-visible z-10">
                    
                    {/* Corner Decor */}
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-white rounded-full border-2 border-coquette-200 flex items-center justify-center shadow-md animate-float">
                        <span className="text-2xl">🎀</span>
                    </div>

                    {/* Vibe Personality Header */}
                    <div className="text-center mb-8 mt-4">
                      <div className="inline-block bg-coquette-50 px-6 py-2 rounded-full border border-coquette-100 mb-2">
                        <h3 className="text-2xl font-serif text-coquette-900 italic">{outfit.creative_title}</h3>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-xs text-coquette-500 font-bold uppercase tracking-widest">
                         <Music size={12} className="text-coquette-400" />
                         Vibe Song: {outfit.vibe_playlist}
                      </div>
                      <button 
                         onClick={handleAnalyze} 
                         className="absolute top-8 right-8 text-coquette-400 hover:text-coquette-800 transition-colors p-2 hover:bg-coquette-50 rounded-full"
                         title="Shuffle/Remix"
                      >
                         <Shuffle size={20} />
                      </button>
                    </div>

                    {/* Hybrid Flat Lay Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                        {outfit.items.map((item, i) => {
                          const ownedImg = item.is_owned ? getOwnedImage(item.id) : null;
                          
                          // Determine layout class based on index/category for "Flat Lay" feel
                          // This is a simplified logic: 1st large, others smaller grid
                          const isFeature = i === 0 || i === 1;

                          return (
                            <div 
                              key={i} 
                              className={`
                                relative bg-white rounded-2xl p-3 border border-coquette-100 shadow-sm flex flex-col items-center justify-center group/item transition-all hover:scale-[1.02]
                                ${isFeature ? 'aspect-[3/4]' : 'aspect-square'}
                                ${!item.is_owned ? 'border-dashed border-coquette-300 bg-coquette-50/30' : ''}
                              `}
                            >
                               {item.is_owned && ownedImg ? (
                                 <div className="w-full h-full relative overflow-hidden rounded-xl">
                                    <img src={ownedImg} className="w-full h-full object-cover" />
                                    <div className="absolute bottom-2 left-2 bg-white/90 px-2 py-1 text-[8px] font-bold text-coquette-900 rounded-md">OWNED</div>
                                 </div>
                               ) : (
                                 <div className="flex flex-col items-center justify-center h-full w-full p-2 text-center">
                                    <span className="text-3xl mb-2 opacity-80">
                                      {item.category.toLowerCase().includes('shoe') ? '🩰' : 
                                       item.category.toLowerCase().includes('bag') ? '👛' : 
                                       item.category.toLowerCase().includes('top') ? '👚' : '👗'}
                                    </span>
                                    <p className="font-serif text-coquette-900 text-sm leading-tight mb-2">{item.name}</p>
                                    <button 
                                      onClick={() => openShoppingLink(item.name)}
                                      className="bg-coquette-600 text-white px-3 py-1.5 rounded-full text-[9px] uppercase font-bold tracking-widest flex items-center gap-1 hover:bg-coquette-800"
                                    >
                                      <ShoppingBag size={10} /> Shop
                                    </button>
                                 </div>
                               )}
                            </div>
                          )
                        })}
                    </div>

                    {/* Manicure & Styling Tip Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Manicure Card */}
                      <div className="md:col-span-1 bg-gradient-to-br from-[#FFF0F5] to-white p-6 rounded-[2rem] border border-coquette-100 flex flex-col justify-center items-center text-center shadow-sm relative overflow-hidden group/nails">
                          <Hand className="w-8 h-8 text-coquette-400 mb-2 group-hover/nails:text-coquette-500 transition-colors" />
                          <h4 className="font-serif font-bold text-coquette-900 mb-1">Nail Bar</h4>
                          <p className="text-sm font-sans text-coquette-700 leading-snug">{outfit.manicure_suggestion}</p>
                      </div>

                      {/* Styling Note */}
                      <div className="md:col-span-2 bg-[radial-gradient(#FFE4E1_1px,transparent_1px)] [background-size:16px_16px] bg-white p-6 rounded-[2rem] border border-coquette-100 relative">
                        <p className="font-serif font-bold text-coquette-900 mb-2 text-sm flex items-center gap-2 pl-4">
                          <Sparkles size={14} className="text-coquette-400" /> Style Note
                        </p>
                        <p className="font-sans text-coquette-800 leading-relaxed text-sm pl-4">{outfit.styling_tip}</p>
                      </div>
                    </div>
                    
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full min-h-[500px] border-[4px] border-dotted border-coquette-200 bg-white/40 flex flex-col items-center justify-center text-coquette-300 rounded-[3rem] relative overflow-hidden group">
               {/* Background Texture */}
               <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#D6336C_1px,transparent_1px)] [background-size:24px_24px]"></div>
               
               <img src="https://image.pollinations.ai/prompt/vintage parisian postcard cherubs aesthetic faint background?width=600&height=600&nologo=true" className="absolute inset-0 opacity-10 object-cover w-full h-full pointer-events-none group-hover:opacity-15 transition-opacity duration-700" />
               
              <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center mb-6 shadow-[0_8px_30px_rgba(255,182,193,0.3)] z-10 animate-float">
                <span className="font-serif italic text-5xl text-coquette-400">C</span>
              </div>
              <p className="font-serif italic text-3xl text-coquette-800 z-10 mb-2">Your dream wardrobe awaits.</p>
              <p className="text-sm font-light mt-2 max-w-xs text-center text-coquette-600 z-10 bg-white/60 px-4 py-2 rounded-full backdrop-blur-sm">
                Select a vibe and click "Generate" to see your personal stylist's picks.
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
                    <h3 className="font-serif text-3xl text-coquette-900">Wardrobe Selector</h3>
                    <p className="text-coquette-500 text-sm">Pick items to mix & match with your uploads.</p>
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
                    <p className="text-sm">Go to "My Digital Closet" to add items first.</p>
                  </div>
                ) : filteredClosetItems.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center text-coquette-400">
                    <Filter size={32} className="mb-4 opacity-50" />
                    <p className="font-serif text-lg">No items in this category.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredClosetItems.map(item => {
                      const isSelected = selectedClosetItemIds.includes(item.id);
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
                  <span className="text-coquette-600 text-sm font-bold">{selectedClosetItemIds.length} items selected</span>
                  <button onClick={() => updateState({ selectedClosetItemIds: [] })} className="text-xs text-coquette-400 underline ml-3 hover:text-coquette-600">Clear All</button>
               </div>
               <button 
                onClick={() => setIsClosetModalOpen(false)}
                className="bg-coquette-600 text-white px-8 py-3 rounded-full font-serif text-lg hover:bg-coquette-800 transition-colors shadow-lg shadow-coquette-200 btn-press"
               >
                 Confirm Selection
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StyleMyCloset;
