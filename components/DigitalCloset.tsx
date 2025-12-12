
import React, { useState, useRef } from 'react';
import { Plus, X, Upload, Trash2, Download, Heart, Tag, Repeat, Sparkles, DollarSign, Loader2, Palette } from 'lucide-react';
import { useCloset } from '../hooks/useCloset';
import { Category, Season, ClosetItem } from '../types';
import { autoTagImage } from '../services/geminiService';

const CATEGORIES: Category[] = ['Top', 'Bottom', 'Dress', 'Outerwear', 'Shoes', 'Bag', 'Accessory'];
const SEASONS: Season[] = ['Spring', 'Summer', 'Autumn', 'Winter', 'Year-Round'];

const DigitalCloset: React.FC = () => {
  const { closetItems, wishlistItems, addToCloset, removeFromCloset, incrementWornCount } = useCloset();
  const [isAdding, setIsAdding] = useState(false);
  
  // Filter States
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  
  // Form States
  const [newItemImage, setNewItemImage] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<Category>('Top');
  const [newItemSeason, setNewItemSeason] = useState<Season>('Year-Round');
  const [newItemColor, setNewItemColor] = useState('');

  // Analysis State
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);

  // Animation State
  const [showConfetti, setShowConfetti] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setNewItemImage(base64);

        // Start Auto-Tagging
        setIsAnalyzingImage(true);
        try {
           // 1. Minimum delay for visual effect - Reduced to 800ms for speed
           const delayPromise = new Promise(resolve => setTimeout(resolve, 800));
           
           // 2. Parallel request to Gemini
           const tagPromise = autoTagImage(base64);

           // Wait for both
           const [_, tags] = await Promise.all([delayPromise, tagPromise]);
           
           setNewItemName(tags.name);
           setNewItemCategory(tags.category);
           setNewItemSeason(tags.season);
           setNewItemColor(tags.color);
           // If price is 0, don't overwrite if user typed something (though fields are disabled)
           if (tags.estimatedPrice > 0) setNewItemPrice(tags.estimatedPrice.toString());

        } catch (error) {
           console.error("Auto-tagging error", error);
        } finally {
           setIsAnalyzingImage(false);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleSaveItem = () => {
    if (!newItemImage || !newItemName || !newItemPrice) return;

    const newItem: ClosetItem = {
      id: Date.now().toString(),
      image: newItemImage,
      name: newItemName,
      category: newItemCategory,
      season: newItemSeason,
      price: parseFloat(newItemPrice),
      dateAdded: Date.now(),
      timesWorn: 0,
      color: newItemColor
    };

    const success = addToCloset(newItem);
    if (success) {
      setIsAdding(false);
      resetForm();
      triggerConfetti();
    }
  };

  const resetForm = () => {
    setNewItemImage(null);
    setNewItemName('');
    setNewItemPrice('');
    setNewItemCategory('Top');
    setNewItemSeason('Year-Round');
    setNewItemColor('');
    setIsAnalyzingImage(false);
  };

  const filteredItems = activeCategory === 'All' 
    ? closetItems 
    : closetItems.filter(item => item.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20 relative">
      
       {/* Confetti Overlay */}
       {showConfetti && (
         <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden" aria-hidden="true">
            <div className="text-6xl animate-bounce absolute top-1/4 left-1/4">🎉</div>
            <div className="text-6xl animate-pulse absolute top-1/3 right-1/4">🎀</div>
            <div className="text-6xl animate-spin absolute bottom-1/4 left-1/3">💖</div>
            <div className="text-6xl animate-bounce absolute top-1/2 right-1/3">✨</div>
         </div>
       )}

       {/* Decorative Header with Add Button */}
      <div className="h-60 w-full overflow-hidden rounded-[3rem] relative border-4 border-white shadow-lg group">
         <img src="https://image.pollinations.ai/prompt/vintage dollhouse bedroom interior pastel pink aesthetic?width=1200&height=400&nologo=true" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000" alt="Vintage Dollhouse Bedroom Interior" />
         <div className="absolute inset-0 bg-gradient-to-r from-coquette-100/90 to-transparent flex items-center pl-10">
            <div className="space-y-4">
               <div>
                  <h1 className="text-coquette-900 font-serif text-5xl drop-shadow-sm mb-1">My Digital Closet</h1>
                  <p className="text-coquette-600 font-sans text-sm tracking-widest uppercase bg-white/50 px-3 py-1 rounded-full inline-block backdrop-blur-sm">Curated Collection • {closetItems.length} Items</p>
               </div>
               
               <button 
                onClick={() => setIsAdding(true)}
                className="bg-coquette-600 text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-coquette-800 transition-all flex items-center gap-2 rounded-full shadow-lg shadow-coquette-300 btn-press transform hover:-translate-y-1"
                aria-label="Add new item to closet"
              >
                <span aria-hidden="true">🎀</span> Add Treasure
              </button>
            </div>
         </div>
      </div>

      {/* Filters */}
      <div className="flex overflow-x-auto pb-2 gap-3 no-scrollbar pl-2" role="tablist" aria-label="Category Filters">
        <button
          onClick={() => setActiveCategory('All')}
          aria-selected={activeCategory === 'All'}
          role="tab"
          className={`
            px-6 py-2 whitespace-nowrap text-xs uppercase tracking-widest transition-all rounded-full border-2 font-bold
            ${activeCategory === 'All' ? 'bg-white border-coquette-600 text-coquette-900 shadow-md' : 'bg-white/50 border-transparent text-coquette-400 hover:bg-white'}
          `}
        >
          View All
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            role="tab"
            aria-selected={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
            className={`
              px-6 py-2 whitespace-nowrap text-xs uppercase tracking-widest transition-all rounded-full border-2 font-bold
              ${activeCategory === cat ? 'bg-white border-coquette-600 text-coquette-900 shadow-md' : 'bg-white/50 border-transparent text-coquette-400 hover:bg-white'}
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid - Wooden Shelves Look */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12 px-4" role="list">
          {filteredItems.map(item => {
             // ROI Calculation
             const timesWorn = item.timesWorn || 0;
             const cpw = timesWorn === 0 ? item.price : item.price / timesWorn;
             
             return (
            <div key={item.id} className="group relative flex flex-col animate-fade-up" role="listitem">
              
              {/* Shelf Graphic */}
              <div className="absolute bottom-10 left-[-10%] right-[-10%] h-4 bg-wood-200 rounded-lg shadow-md z-0" aria-hidden="true"></div>
              <div className="absolute bottom-10 left-[-8%] right-[-8%] h-1 bg-wood-300/50 z-0" aria-hidden="true"></div>

              {/* Item Card */}
              <div className="aspect-[3/4] bg-white rounded-2xl relative overflow-hidden mb-3 border-2 border-white shadow-md transition-all duration-500 group-hover:-translate-y-2 group-hover:rotate-1 z-10 cursor-pointer">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-coquette-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <div className="flex justify-end">
                       <button 
                        onClick={() => removeFromCloset(item.id)}
                        className="bg-white text-coquette-400 hover:text-red-500 p-2 rounded-full shadow-sm hover:scale-110 transition-all"
                        aria-label={`Delete ${item.name}`}
                       >
                        <Trash2 size={14} aria-hidden="true" />
                       </button>
                    </div>
                </div>
                
                {/* Cost Per Wear - Floating Tag */}
                <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-sm flex justify-between items-center">
                   <div className="flex flex-col">
                      <span className="text-[7px] uppercase font-bold text-coquette-400 tracking-wider">Cost/Wear</span>
                      <span className="text-xs font-serif text-coquette-900 font-bold">${cpw.toFixed(0)}</span>
                   </div>
                   
                   {/* I Wore This Button */}
                   <button 
                     onClick={() => { incrementWornCount(item.id); triggerConfetti(); }}
                     className="flex items-center gap-1 bg-coquette-50 hover:bg-coquette-200 text-coquette-600 px-2 py-1 rounded-full transition-colors border border-coquette-200"
                     title={`Worn ${timesWorn} times`}
                     aria-label={`Mark ${item.name} as worn`}
                   >
                     <Repeat size={10} aria-hidden="true" />
                     <span className="text-[8px] font-bold uppercase">Wore It</span>
                   </button>
                </div>
              </div>

              {/* Info under shelf */}
              <div className="text-center px-1 mt-2 z-10">
                <h3 className="font-serif text-lg leading-tight truncate text-coquette-900">{item.name}</h3>
                <p className="text-[10px] uppercase tracking-wider text-coquette-400 mt-1 bg-white/50 inline-block px-2 rounded-full">{item.season}</p>
              </div>
            </div>
          )})}
        </div>
      ) : (
        <div className="py-24 text-center border-4 border-dotted border-coquette-200 rounded-[3rem] bg-white/40 mx-4">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
             <span className="text-4xl" role="img" aria-label="Swan emoji">🦢</span>
          </div>
          <p className="font-serif text-3xl text-coquette-800 italic">The shelves are bare, darling.</p>
          <p className="text-coquette-500 text-sm mt-2 font-sans">Start adding pieces to build your dream dollhouse.</p>
        </div>
      )}

      {/* Add Item Modal Overlay */}
      {isAdding && (
        <div className="fixed inset-0 bg-coquette-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="add-item-title">
          <div className="bg-cream w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl flex flex-col md:flex-row animate-pop border-[6px] border-white relative">
            
            {/* Close Button */}
            <button onClick={() => { setIsAdding(false); resetForm(); }} className="absolute top-4 right-4 bg-white p-2 rounded-full text-coquette-400 hover:text-coquette-900 z-20 shadow-sm" aria-label="Close Modal"><X size={20} /></button>

            {/* Image Upload Side */}
            <div 
              className="w-full md:w-1/2 bg-coquette-50 aspect-[3/4] md:aspect-auto flex flex-col items-center justify-center relative cursor-pointer border-r-4 border-white group"
              onClick={() => !isAnalyzingImage && fileInputRef.current?.click()}
              role="button"
              aria-label="Upload Item Image"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') fileInputRef.current?.click() }}
            >
              {newItemImage ? (
                <>
                  <img src={newItemImage} alt="Preview" className="w-full h-full object-cover opacity-90" />
                  {isAnalyzingImage && (
                    <div className="absolute inset-0 bg-coquette-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10 p-6 text-center animate-fade-in">
                       <Loader2 size={48} className="animate-spin mb-4 text-coquette-200" />
                       <h4 className="font-serif text-2xl mb-2 animate-pulse-fast">Gemini Vision</h4>
                       <p className="text-xs uppercase tracking-widest font-bold text-coquette-100">Analyzing fabric & style...</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                     <Upload className="text-coquette-400 w-6 h-6" aria-hidden="true" />
                  </div>
                  <p className="font-serif text-coquette-800 text-2xl italic">Upload Photo</p>
                  <p className="text-xs text-coquette-500 mt-2 uppercase tracking-widest">Tap to browse</p>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} aria-hidden="true" disabled={isAnalyzingImage} />
            </div>

            {/* Form Side */}
            <div className={`w-full md:w-1/2 p-8 space-y-6 flex flex-col justify-center bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] relative transition-opacity ${isAnalyzingImage ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              
              {/* Analysis Overlay for Form */}
              {isAnalyzingImage && (
                <div className="absolute inset-0 z-20 cursor-wait"></div>
              )}

              <div>
                 <h3 id="add-item-title" className="font-serif text-3xl text-coquette-900 mb-1">New Treasure</h3>
                 <div className="h-1 w-12 bg-coquette-300 rounded-full"></div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="itemName" className="text-[9px] uppercase tracking-wider font-bold text-coquette-500 block mb-1">Item Name</label>
                  {isAnalyzingImage ? (
                    <div className="h-12 w-full bg-coquette-100 rounded-xl animate-pulse-fast"></div>
                  ) : (
                    <input 
                      id="itemName"
                      type="text" 
                      value={newItemName}
                      onChange={e => setNewItemName(e.target.value)}
                      className="w-full bg-white border-2 border-coquette-100 rounded-xl px-4 py-3 focus:outline-none focus:border-coquette-400 font-serif text-lg text-coquette-900 placeholder:font-sans placeholder:text-sm"
                      placeholder="e.g. Vintage Silk Blouse"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="itemPrice" className="text-[9px] uppercase tracking-wider font-bold text-coquette-500 block mb-1">Price Paid ($)</label>
                    {isAnalyzingImage ? (
                      <div className="h-12 w-full bg-coquette-100 rounded-xl animate-pulse-fast"></div>
                    ) : (
                      <input 
                        id="itemPrice"
                        type="number" 
                        value={newItemPrice}
                        onChange={e => setNewItemPrice(e.target.value)}
                        className="w-full bg-white border-2 border-coquette-100 rounded-xl px-4 py-3 focus:outline-none focus:border-coquette-400 font-sans text-coquette-900"
                        placeholder="0.00"
                      />
                    )}
                  </div>
                  <div>
                    <label htmlFor="itemColor" className="text-[9px] uppercase tracking-wider font-bold text-coquette-500 block mb-1">Color</label>
                    {isAnalyzingImage ? (
                      <div className="h-12 w-full bg-coquette-100 rounded-xl animate-pulse-fast"></div>
                    ) : (
                      <div className="relative">
                         <input 
                          id="itemColor"
                          type="text" 
                          value={newItemColor}
                          onChange={e => setNewItemColor(e.target.value)}
                          className="w-full bg-white border-2 border-coquette-100 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:border-coquette-400 font-sans text-coquette-900"
                          placeholder="e.g. Red"
                        />
                        <Palette size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-coquette-300" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="itemCategory" className="text-[9px] uppercase tracking-wider font-bold text-coquette-500 block mb-1">Category</label>
                    {isAnalyzingImage ? (
                      <div className="h-12 w-full bg-coquette-100 rounded-xl animate-pulse-fast"></div>
                    ) : (
                      <div className="relative">
                          <select 
                          id="itemCategory"
                          value={newItemCategory}
                          onChange={(e) => setNewItemCategory(e.target.value as Category)}
                          className="w-full bg-white border-2 border-coquette-100 rounded-xl px-4 py-3 appearance-none text-sm text-coquette-900 focus:outline-none"
                          >
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-coquette-400" aria-hidden="true">▼</div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="itemSeason" className="text-[9px] uppercase tracking-wider font-bold text-coquette-500 block mb-1">Season</label>
                    {isAnalyzingImage ? (
                      <div className="h-12 w-full bg-coquette-100 rounded-xl animate-pulse-fast"></div>
                    ) : (
                      <div className="relative">
                          <select 
                          id="itemSeason"
                          value={newItemSeason}
                          onChange={(e) => setNewItemSeason(e.target.value as Season)}
                          className="w-full bg-white border-2 border-coquette-100 rounded-xl px-4 py-3 appearance-none text-sm text-coquette-900 focus:outline-none"
                          >
                          {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-coquette-400" aria-hidden="true">▼</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSaveItem}
                disabled={!newItemImage || !newItemName || !newItemPrice || isAnalyzingImage}
                className="w-full bg-coquette-600 text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-coquette-800 disabled:opacity-50 transition-all mt-4 rounded-full shadow-lg btn-press flex justify-center items-center gap-2"
                aria-label="Confirm Add Item to Closet"
              >
                <span aria-hidden="true">🎀</span> Add to Closet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalCloset;
