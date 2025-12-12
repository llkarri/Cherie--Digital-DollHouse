
import React, { useState, useRef } from 'react';
import { useCloset } from '../hooks/useCloset';
import { ClosetItem, OutfitRating, Category } from '../types';
import { rateOutfit } from '../services/geminiService';
import { Sparkles, ShoppingBag, X, Star, Upload, Grid, Plus, CheckCircle2, RotateCcw } from 'lucide-react';

const CATEGORIES: Category[] = ['Top', 'Bottom', 'Dress', 'Outerwear', 'Shoes', 'Bag', 'Accessory'];

const DressingRoom: React.FC = () => {
  const { closetItems } = useCloset();
  const [canvasItems, setCanvasItems] = useState<ClosetItem[]>([]);
  const [rating, setRating] = useState<OutfitRating | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Modal State
  const [isClosetModalOpen, setIsClosetModalOpen] = useState(false);
  const [modalCategoryFilter, setModalCategoryFilter] = useState<Category | 'All'>('All');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addToCanvas = (item: ClosetItem) => {
    if (canvasItems.find(i => i.id === item.id)) return;
    setCanvasItems(prev => [...prev, item]);
    setRating(null); // Reset rating on change
  };

  const removeFromCanvas = (id: string) => {
    setCanvasItems(prev => prev.filter(i => i.id !== id));
    setRating(null);
  };

  const handleClearCanvas = () => {
    if (canvasItems.length > 0) {
       if (window.confirm("Clear the dressing room?")) {
         setCanvasItems([]);
         setRating(null);
       }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const tempItem: ClosetItem = {
          id: `temp-${Date.now()}`,
          image: base64,
          name: "Uploaded Find",
          category: 'Top', // Default
          season: 'Year-Round',
          price: 0,
          dateAdded: Date.now(),
          timesWorn: 0
        };
        addToCanvas(tempItem);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRateFit = async () => {
    if (canvasItems.length === 0) return;
    setIsAnalyzing(true);
    try {
      const result = await rateOutfit(canvasItems);
      setRating(result);
    } catch (e) {
      console.error(e);
      alert("Oops! The stylist is busy. Try again?");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const openShoppingLink = (itemName: string) => {
    const query = encodeURIComponent(`buy ${itemName} coquette style`);
    window.open(`https://www.google.com/search?tbm=shop&q=${query}`, '_blank');
  };

  const filteredClosetItems = modalCategoryFilter === 'All' 
    ? closetItems 
    : closetItems.filter(item => item.category === modalCategoryFilter);

  return (
    <div className="h-[calc(100vh-100px)] flex gap-6 animate-fade-in relative pb-10">
      
      {/* Left Panel: Tools & Quick Stash */}
      <div className="w-1/3 flex flex-col gap-4">
        {/* Controls Card */}
        <div className="bg-white rounded-[2rem] p-6 border-2 border-coquette-100 shadow-sm relative">
           <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-serif text-coquette-900 flex items-center gap-2">
                <Grid size={24} /> The Rack
              </h3>
              <button 
                onClick={handleClearCanvas}
                disabled={canvasItems.length === 0}
                className="text-[10px] uppercase font-bold text-coquette-400 hover:text-red-500 disabled:opacity-30 flex items-center gap-1 transition-colors"
                title="Clear Canvas"
              >
                <RotateCcw size={12} /> Reset
              </button>
           </div>

           <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-4 bg-coquette-50 rounded-xl border border-coquette-100 hover:border-coquette-300 transition-all group"
              >
                 <Upload size={20} className="text-coquette-500 mb-2 group-hover:scale-110 transition-transform" />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-coquette-800">Upload</span>
                 <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
              </button>
              <button 
                onClick={() => setIsClosetModalOpen(true)}
                className="flex flex-col items-center justify-center p-4 bg-white border-2 border-dashed border-coquette-200 rounded-xl hover:border-coquette-400 transition-all group"
              >
                 <Sparkles size={20} className="text-coquette-400 mb-2 group-hover:scale-110 transition-transform" />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-coquette-800">My Closet</span>
              </button>
           </div>
        </div>

        {/* Quick Closet List */}
        <div className="flex-1 bg-white/60 backdrop-blur-md border-2 border-white rounded-[2.5rem] p-6 shadow-lg overflow-hidden flex flex-col">
           <p className="text-xs uppercase tracking-widest text-coquette-400 font-bold mb-4 text-center">Quick Add</p>
           <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 grid grid-cols-2 gap-3 auto-rows-min">
              {closetItems.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => addToCanvas(item)}
                  className="aspect-[3/4] bg-white rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform border border-coquette-100 shadow-sm relative group"
                >
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Plus size={20} className="text-coquette-800" />
                  </div>
                </div>
              ))}
              {closetItems.length === 0 && (
                 <div className="col-span-2 text-center text-coquette-400 mt-10">
                   <p className="font-serif italic">Your closet is empty, darling.</p>
                 </div>
              )}
           </div>
        </div>
      </div>

      {/* Right: The Canvas */}
      <div className="flex-1 flex flex-col gap-6">
         {/* Canvas Area */}
         <div className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] bg-cream rounded-[3rem] border-4 border-dashed border-coquette-200 relative shadow-inner p-8 flex items-center justify-center overflow-hidden">
             
             {/* Center Mannequin / Placeholder */}
             {canvasItems.length === 0 && (
               <div className="text-center opacity-40">
                  <div className="text-6xl mb-4">👗</div>
                  <p className="font-serif text-2xl text-coquette-800">The Dressing Room</p>
                  <p className="text-sm text-coquette-600">Upload photos or pick from your closet to style a look.</p>
               </div>
             )}

             {/* Draggable-ish Free Layout (CSS Grid for simplicity now) */}
             <div className="grid grid-cols-3 gap-8 w-full h-full content-center">
                 {canvasItems.map(item => (
                   <div key={item.id} className="relative group animate-pop">
                      <div className="bg-white p-2 rounded-2xl shadow-md rotate-2 hover:rotate-0 transition-transform duration-300 border border-white">
                        <img src={item.image} className="w-full h-auto rounded-xl max-h-60 object-contain mx-auto" />
                      </div>
                      <button 
                        onClick={() => removeFromCanvas(item.id)}
                        className="absolute -top-2 -right-2 bg-red-100 text-red-400 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                   </div>
                 ))}
             </div>
         </div>

         {/* Action Bar */}
         <div className="h-32 bg-white rounded-[2.5rem] border border-coquette-100 shadow-lg p-6 flex items-center justify-between gap-8 relative overflow-hidden">
             {/* Background Decoration */}
             <div className="absolute top-0 right-0 p-2 opacity-10">
                <Sparkles size={100} className="text-coquette-300" />
             </div>

             {/* Rating Result */}
             {rating ? (
               <div className="flex-1 flex items-center gap-6 animate-fade-in relative z-10">
                 <div className="w-20 h-20 bg-coquette-600 rounded-full flex flex-col items-center justify-center text-white shadow-md border-4 border-coquette-200">
                    <span className="text-3xl font-serif font-bold">{rating.score}</span>
                    <span className="text-[8px] uppercase tracking-wider opacity-80">/ 10</span>
                 </div>
                 <div className="flex-1">
                   <p className="font-serif text-xl text-coquette-900 italic mb-1">"{rating.comment}"</p>
                   {rating.missing_item_suggestion && (
                     <div className="flex items-center gap-2 mt-2">
                       <span className="text-xs text-coquette-500 font-bold uppercase tracking-wider">Missing:</span>
                       <button 
                         onClick={() => openShoppingLink(rating.missing_item_suggestion!)}
                         className="flex items-center gap-1 bg-coquette-50 hover:bg-coquette-100 text-coquette-700 px-3 py-1 rounded-full text-xs font-bold transition-colors border border-coquette-200"
                       >
                         <ShoppingBag size={12} /> Buy {rating.missing_item_suggestion}
                       </button>
                     </div>
                   )}
                 </div>
               </div>
             ) : (
                <div className="flex-1 flex items-center gap-4 text-coquette-400">
                  <Star size={24} />
                  <p className="font-serif italic text-lg">Assemble your look to get AI feedback...</p>
                </div>
             )}

             {/* Action Button */}
             <button
                onClick={handleRateFit}
                disabled={isAnalyzing || canvasItems.length === 0}
                className="bg-gradient-to-r from-coquette-400 to-coquette-600 text-white px-10 py-4 rounded-full font-serif text-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed btn-press flex-shrink-0 relative z-10"
             >
                {isAnalyzing ? (
                  <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Styling...</span>
                ) : (
                  <span className="flex items-center gap-2">Rate This Fit 🎀</span>
                )}
             </button>
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
                    <h3 className="font-serif text-3xl text-coquette-900">Select from Closet</h3>
                    <p className="text-coquette-500 text-sm">Pick items to mix & match.</p>
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
                {filteredClosetItems.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center text-coquette-400">
                    <Grid size={32} className="mb-4 opacity-50" />
                    <p className="font-serif text-lg">No items in this category.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredClosetItems.map(item => {
                      const isSelected = canvasItems.find(i => i.id === item.id);
                      return (
                        <div 
                          key={item.id}
                          onClick={() => isSelected ? removeFromCanvas(item.id) : addToCanvas(item)}
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
                  <span className="text-coquette-600 text-sm font-bold">{canvasItems.length} items on canvas</span>
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

    </div>
  );
};

export default DressingRoom;
