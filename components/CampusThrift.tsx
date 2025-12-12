
import React, { useState, useRef, useEffect } from 'react';
import { useCloset } from '../hooks/useCloset';
import { Store, MessageCircle, DollarSign, Tag, Plus, Upload, X, Trash2, Heart, Filter, Sparkles, Receipt, Camera, Shirt, RotateCcw } from 'lucide-react';
import { ThriftItem, ThriftCollection, ClosetItem, Category } from '../types';

const UNIVERSITIES = ["UIUC", "Harvard", "UCLA", "NYU", "Stanford", "Parsons", "FIT", "Columbia"];
const CONDITIONS = ["New with Tags", "Like New", "Good", "Fair"];
const CATEGORIES: Category[] = ['Top', 'Bottom', 'Dress', 'Outerwear', 'Shoes', 'Bag', 'Accessory'];
const COLLECTIONS: { label: string; value: ThriftCollection | 'All', emoji: string, desc: string }[] = [
  { label: 'All Treasures', value: 'All', emoji: '🎀', desc: 'Everything' },
  { label: 'Old Money', value: 'Old Money', emoji: '🕰️', desc: 'Timeless Classics' },
  { label: 'Princess Core', value: 'Princess Core', emoji: '👑', desc: 'Luxury & High-End' },
  { label: 'Downtown Doll', value: 'Downtown Doll', emoji: '🎧', desc: 'Streetwear & Casual' },
  { label: 'Vintage Heirlooms', value: 'Vintage Heirlooms', emoji: '🕯️', desc: 'Thrifted Gems' },
];

const CampusThrift: React.FC = () => {
  const { thriftItems, addThriftItem, removeThriftItem, markAsSold, earnings, closetItems, userProfile, refreshItems } = useCloset();
  const [selectedUni, setSelectedUni] = useState("UIUC");
  const [isSelling, setIsSelling] = useState(false);
  const [isRackModalOpen, setIsRackModalOpen] = useState(false);
  
  // Filters for Main Marketplace
  const [activeCollection, setActiveCollection] = useState<ThriftCollection | 'All'>('All');
  const [priceRange, setPriceRange] = useState<number>(200);

  // Filters for "From My Rack" Modal
  const [rackCategory, setRackCategory] = useState<Category | 'All'>('All');

  // Sell Form State
  const [newItemImage, setNewItemImage] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemSize, setNewItemSize] = useState('');
  const [newItemCondition, setNewItemCondition] = useState('Like New');
  const [newItemCollection, setNewItemCollection] = useState<ThriftCollection>('Downtown Doll');
  const [newItemUni, setNewItemUni] = useState(selectedUni);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => setNewItemImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleOpenRackModal = () => {
    refreshItems(); // Force data refresh from localStorage to ensure we see latest items
    setRackCategory('All'); // Reset filter
    setIsRackModalOpen(true);
  };

  const handleRackSelect = (item: ClosetItem) => {
    setNewItemImage(item.image);
    setNewItemName(item.name);
    
    // Smart Pricing: Suggest 70% of original price, rounded down
    const suggestedPrice = Math.floor(item.price * 0.7);
    setNewItemPrice(suggestedPrice > 0 ? suggestedPrice.toString() : '');
    
    // Auto-fill description
    setNewItemDesc(`Pre-loved ${item.name} from my personal collection. Perfect for ${item.season} season.`);
    
    // Auto-guess size based on category using User Profile defaults
    if (item.category === 'Shoes') {
        setNewItemSize(userProfile.sizes.shoe);
    } else if (['Bottom', 'Dress'].includes(item.category)) {
        setNewItemSize(userProfile.sizes.bottom);
    } else {
        setNewItemSize(userProfile.sizes.top);
    }

    setIsRackModalOpen(false);
  };

  const handleListItem = () => {
    if (!newItemImage || !newItemName || !newItemPrice || !newItemSize) return;

    const item: ThriftItem = {
      id: Date.now().toString(),
      image: newItemImage,
      name: newItemName,
      price: parseFloat(newItemPrice),
      size: newItemSize,
      condition: newItemCondition,
      university: newItemUni,
      dateListed: Date.now(),
      description: newItemDesc,
      collection: newItemCollection
    };

    addThriftItem(item);
    setIsSelling(false);
    resetForm();
  };

  const resetForm = () => {
    setNewItemImage(null);
    setNewItemName('');
    setNewItemDesc('');
    setNewItemPrice('');
    setNewItemSize('');
    setNewItemCondition('Like New');
  };

  const handleBuy = (item: ThriftItem) => {
    if (window.confirm(`Buy "${item.name}" for $${item.price}? This simulates a purchase.`)) {
       markAsSold(item.id, item.price);
       alert("Purchase successful! Item removed from marketplace.");
    }
  };

  const handleChat = (itemName: string) => {
    alert(`Starting chat for "${itemName}"... (Simulated)`);
  };

  // Filter items for Marketplace
  const displayItems = thriftItems.filter(item => {
    const matchesUni = item.university === selectedUni;
    const matchesCollection = activeCollection === 'All' || item.collection === activeCollection;
    const matchesPrice = item.price <= priceRange;
    return matchesUni && matchesCollection && matchesPrice;
  });

  // Filter items for Rack Modal
  const filteredRackItems = closetItems.filter(item => {
    if (rackCategory === 'All') return true;
    return item.category === rackCategory;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-32">
      
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
         
         {/* Main Banner */}
         <div className="flex-1 w-full bg-white border-2 border-coquette-100 rounded-[3rem] p-8 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-coquette-50 rounded-full blur-3xl -z-10 group-hover:bg-coquette-100 transition-colors"></div>
            
            <div className="flex justify-between items-start mb-4">
               <div className="inline-flex items-center gap-2 bg-coquette-50 px-3 py-1 rounded-full border border-coquette-200">
                  <Store size={14} className="text-coquette-600" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-coquette-600">Student Marketplace</span>
               </div>
               
               {/* Campus Selector */}
               <div className="bg-white p-1 pl-4 rounded-full border border-coquette-200 shadow-sm flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-coquette-400">Campus</span>
                  <select 
                    value={selectedUni}
                    onChange={(e) => setSelectedUni(e.target.value)}
                    className="bg-coquette-50 text-coquette-900 font-serif font-bold text-sm py-1.5 px-3 rounded-full border-none focus:ring-0 cursor-pointer hover:bg-coquette-100 transition-colors appearance-none"
                  >
                    {UNIVERSITIES.map(uni => <option key={uni} value={uni}>{uni}</option>)}
                  </select>
               </div>
            </div>

            <h2 className="text-5xl font-serif text-coquette-900 mb-2">Campus Thrift</h2>
            <p className="text-coquette-500 font-sans max-w-md">Curated treasures from students at top universities. Find your next heirloom.</p>

            <button 
               onClick={() => setIsSelling(true)}
               className="mt-6 bg-gradient-to-r from-coquette-500 to-coquette-600 text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:shadow-lg hover:-translate-y-1 transition-all flex items-center gap-2 btn-press"
             >
                <Plus size={16} /> List a Treasure 🎀
             </button>
         </div>

         {/* "My Ribbon Fund" - Receipt Style Card */}
         <div className="w-full lg:w-80 bg-cream relative p-6 shadow-md transform rotate-1 hover:rotate-0 transition-transform duration-500">
             {/* Jagged Edges (CSS Clip Path) */}
             <div className="absolute top-0 left-0 right-0 h-2 bg-cream" style={{clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)', top: '-8px'}}></div>
             <div className="absolute bottom-0 left-0 right-0 h-2 bg-cream" style={{clipPath: 'polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%)', bottom: '-8px'}}></div>

             <div className="text-center border-b-2 border-dashed border-coquette-200 pb-4 mb-4">
                <Receipt className="mx-auto text-coquette-400 mb-2" />
                <h3 className="font-serif text-xl text-coquette-900 uppercase tracking-widest">Ribbon Fund</h3>
                <p className="text-[10px] text-coquette-400 font-mono">{new Date().toLocaleDateString()}</p>
             </div>

             <div className="space-y-2 font-mono text-sm text-coquette-800 mb-6">
                <div className="flex justify-between">
                   <span>Items Listed:</span>
                   <span>{thriftItems.length}</span>
                </div>
                <div className="flex justify-between">
                   <span>Platform Fee:</span>
                   <span>0%</span>
                </div>
                <div className="flex justify-between text-coquette-600 font-bold text-lg pt-2 border-t border-coquette-200">
                   <span>Total Earned:</span>
                   <span>${earnings.toFixed(2)}</span>
                </div>
             </div>
             
             <div className="text-center">
               <p className="text-[10px] text-coquette-400 italic">Funds available for transfer</p>
             </div>
         </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-6 sticky top-4 z-30">
         {/* Collections */}
         <div className="flex-1 bg-white/80 backdrop-blur-md p-2 rounded-full border border-coquette-100 shadow-sm flex items-center gap-1 overflow-x-auto no-scrollbar">
            {COLLECTIONS.map(col => (
               <button
                 key={col.value}
                 onClick={() => setActiveCollection(col.value)}
                 className={`
                   px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2
                   ${activeCollection === col.value 
                     ? 'bg-coquette-600 text-white shadow-md' 
                     : 'text-coquette-500 hover:bg-coquette-50'}
                 `}
               >
                 <span>{col.emoji}</span> {col.label}
               </button>
            ))}
         </div>

         {/* Price Slider */}
         <div className="bg-white/80 backdrop-blur-md px-6 py-2 rounded-full border border-coquette-100 shadow-sm flex items-center gap-4 min-w-[250px]">
            <span className="text-[10px] font-bold text-coquette-400 uppercase">Max Price</span>
            <input 
              type="range" 
              min="10" 
              max="500" 
              step="10" 
              value={priceRange}
              onChange={(e) => setPriceRange(parseInt(e.target.value))}
              className="flex-1 h-1 bg-coquette-200 rounded-lg appearance-none cursor-pointer accent-coquette-600"
            />
            <span className="text-sm font-serif text-coquette-900 w-12 text-right">${priceRange}</span>
         </div>
      </div>

      {/* Grid - Polaroid Style */}
      {displayItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-4">
          {displayItems.map((item, idx) => (
               <div 
                 key={item.id} 
                 className={`
                   bg-white p-3 pb-6 shadow-md hover:shadow-2xl transition-all duration-300 transform group
                   ${idx % 2 === 0 ? 'rotate-1 hover:rotate-0' : '-rotate-1 hover:rotate-0'}
                 `}
               >
                  {/* Pin Graphic */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-sm z-10"></div>

                  <div className="aspect-square bg-coquette-50 overflow-hidden mb-4 relative">
                     <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                     
                     {/* Collection Tag */}
                     <div className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-coquette-800 rounded-sm">
                        {item.collection}
                     </div>
                  </div>
                  
                  <div className="px-2 text-center">
                     <h4 className="font-serif text-xl text-coquette-900 truncate mb-1">{item.name}</h4>
                     <p className="text-[10px] text-coquette-500 uppercase tracking-widest mb-3">{item.size} • {item.condition}</p>
                     
                     <div className="font-handwriting text-coquette-800 text-sm mb-4 line-clamp-2 px-2 opacity-80 italic">
                        "{item.description || 'A lovely vintage find...'}"
                     </div>

                     <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-dashed border-coquette-100">
                        <span className="font-serif text-2xl text-coquette-900">${item.price}</span>
                        
                        <div className="flex gap-2">
                          <button 
                             onClick={() => handleChat(item.name)}
                             className="p-2 rounded-full border border-coquette-200 text-coquette-400 hover:text-coquette-600 hover:bg-coquette-50 transition-colors"
                          >
                             <MessageCircle size={16} />
                          </button>
                          <button 
                             onClick={() => handleBuy(item)}
                             className="bg-gradient-to-r from-pink-400 to-yellow-400 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-1"
                          >
                             Buy <Heart size={10} fill="currentColor" />
                          </button>
                        </div>
                     </div>
                  </div>
               </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center border-4 border-dotted border-coquette-200 rounded-[3rem] bg-white/40 mx-4">
           <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm animate-float">
             <DollarSign size={32} className="text-coquette-300" />
           </div>
           <p className="font-serif text-3xl text-coquette-800 italic">No treasures found.</p>
           <p className="text-coquette-500 text-sm mt-2 font-sans">Try adjusting your filters or list the first item!</p>
        </div>
      )}

      {/* Sell Item Modal */}
      {isSelling && (
        <div className="fixed inset-0 bg-coquette-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl flex flex-col md:flex-row border-[6px] border-white animate-pop relative">
             <button onClick={() => setIsSelling(false)} className="absolute top-4 right-4 bg-white p-2 rounded-full text-coquette-400 hover:text-coquette-900 z-20 shadow-sm"><X size={20} /></button>
             
             {/* Left Side: Image Options */}
             <div className="w-full md:w-1/2 bg-coquette-50 relative border-r-4 border-white flex flex-col items-center justify-center p-6 group min-h-[400px]">
                {newItemImage ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                     <img src={newItemImage} className="max-w-full max-h-full object-contain rounded-2xl shadow-inner" />
                     <button 
                       onClick={() => setNewItemImage(null)} 
                       className="absolute top-4 right-4 bg-white/80 backdrop-blur text-coquette-900 p-2 rounded-full shadow-md hover:bg-white transition-colors"
                     >
                        <RotateCcw size={16} />
                     </button>
                  </div>
                ) : (
                  <div className="w-full max-w-xs space-y-3">
                     <p className="font-serif text-3xl text-coquette-900 text-center mb-6 italic">Add a Treasure</p>
                     
                     <button 
                       onClick={() => fileInputRef.current?.click()}
                       className="w-full py-4 bg-white border-2 border-coquette-200 rounded-xl flex items-center justify-center gap-3 text-coquette-600 font-bold uppercase tracking-wider hover:bg-coquette-50 transition-all shadow-sm group/btn"
                     >
                        <Upload size={18} className="group-hover/btn:scale-110 transition-transform" /> Upload File
                     </button>
                     
                     <button 
                       onClick={() => cameraInputRef.current?.click()}
                       className="w-full py-4 bg-white border-2 border-coquette-200 rounded-xl flex items-center justify-center gap-3 text-coquette-600 font-bold uppercase tracking-wider hover:bg-coquette-50 transition-all shadow-sm group/btn"
                     >
                        <Camera size={18} className="group-hover/btn:scale-110 transition-transform" /> Take Photo
                     </button>
                     
                     <div className="flex items-center gap-2 my-2 opacity-50">
                        <div className="h-px bg-coquette-300 flex-1"></div>
                        <span className="text-[10px] text-coquette-400 uppercase font-bold">OR</span>
                        <div className="h-px bg-coquette-300 flex-1"></div>
                     </div>

                     <button 
                       onClick={handleOpenRackModal}
                       className="w-full py-4 bg-gradient-to-r from-coquette-400 to-coquette-500 text-white rounded-xl flex items-center justify-center gap-3 font-bold uppercase tracking-wider hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md relative overflow-hidden group/btn"
                     >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                        <Shirt size={18} className="group-hover/btn:rotate-12 transition-transform" /> From My Rack
                     </button>
                  </div>
                )}
                
                {/* Hidden Inputs */}
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={handleImageUpload} />
             </div>

             {/* Right Side: Form */}
             <div className="w-full md:w-1/2 p-8 bg-lace space-y-4 overflow-y-auto max-h-[90vh]">
                <h3 className="font-serif text-2xl text-coquette-900 mb-2">Item Details</h3>
                
                <div>
                   <label className="text-[9px] uppercase font-bold text-coquette-500 block mb-1">Item Title</label>
                   <input 
                     type="text" 
                     value={newItemName}
                     onChange={(e) => setNewItemName(e.target.value)}
                     className="w-full bg-white border border-coquette-100 rounded-xl px-4 py-2 text-coquette-900"
                     placeholder="e.g. Vintage Denim Jacket"
                   />
                </div>

                <div>
                   <label className="text-[9px] uppercase font-bold text-coquette-500 block mb-1">Description</label>
                   <textarea 
                     value={newItemDesc}
                     onChange={(e) => setNewItemDesc(e.target.value)}
                     className="w-full bg-white border border-coquette-100 rounded-xl px-4 py-2 text-coquette-900 h-20 resize-none"
                     placeholder="Tell the story of this piece..."
                   />
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <div>
                     <label className="text-[9px] uppercase font-bold text-coquette-500 block mb-1">Price ($)</label>
                     <input 
                       type="number" 
                       value={newItemPrice}
                       onChange={(e) => setNewItemPrice(e.target.value)}
                       className="w-full bg-white border border-coquette-100 rounded-xl px-4 py-2 text-coquette-900"
                       placeholder="25"
                     />
                   </div>
                   <div>
                     <label className="text-[9px] uppercase font-bold text-coquette-500 block mb-1">Size</label>
                     <input 
                       type="text" 
                       value={newItemSize}
                       onChange={(e) => setNewItemSize(e.target.value)}
                       className="w-full bg-white border border-coquette-100 rounded-xl px-4 py-2 text-coquette-900"
                       placeholder="M / 6"
                     />
                   </div>
                </div>

                <div>
                   <label className="text-[9px] uppercase font-bold text-coquette-500 block mb-1">Collection</label>
                   <select 
                     value={newItemCollection}
                     onChange={(e) => setNewItemCollection(e.target.value as ThriftCollection)}
                     className="w-full bg-white border border-coquette-100 rounded-xl px-4 py-2 text-coquette-900 text-sm"
                   >
                     {COLLECTIONS.filter(c => c.value !== 'All').map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
                   </select>
                </div>

                 <div className="grid grid-cols-2 gap-3">
                    <div>
                       <label className="text-[9px] uppercase font-bold text-coquette-500 block mb-1">Condition</label>
                       <select 
                         value={newItemCondition}
                         onChange={(e) => setNewItemCondition(e.target.value)}
                         className="w-full bg-white border border-coquette-100 rounded-xl px-4 py-2 text-coquette-900 text-sm"
                       >
                         {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                    <div>
                        <label className="text-[9px] uppercase font-bold text-coquette-500 block mb-1">Campus</label>
                         <select 
                           value={newItemUni}
                           onChange={(e) => setNewItemUni(e.target.value)}
                           className="w-full bg-white border border-coquette-100 rounded-xl px-4 py-2 text-coquette-900 text-sm"
                         >
                           {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
                         </select>
                    </div>
                </div>

                <button 
                  onClick={handleListItem}
                  disabled={!newItemImage || !newItemName || !newItemPrice}
                  className="w-full py-4 bg-coquette-600 text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-coquette-800 disabled:opacity-50 transition-all mt-4"
                >
                  List Treasure
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Rack Selection Modal - Overlay on top of Selling Modal */}
      {isRackModalOpen && (
        <div className="fixed inset-0 bg-coquette-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-3xl h-[80vh] rounded-[3rem] shadow-2xl flex flex-col border-[6px] border-white animate-pop relative overflow-hidden">
              <div className="p-6 border-b border-coquette-100 bg-coquette-50/50 flex flex-col gap-4">
                 <div className="flex justify-between items-center">
                   <h3 className="font-serif text-2xl text-coquette-900">Select from My Rack</h3>
                   <button onClick={() => setIsRackModalOpen(false)} className="p-2 hover:bg-white rounded-full text-coquette-500"><X size={20}/></button>
                 </div>
                 
                 {/* Category Filter for Rack */}
                 <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    <button 
                      onClick={() => setRackCategory('All')}
                      className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold transition-all ${rackCategory === 'All' ? 'bg-coquette-600 text-white shadow-md' : 'bg-white border border-coquette-100 text-coquette-400 hover:bg-coquette-50'}`}
                    >
                      All Items
                    </button>
                    {CATEGORIES.map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setRackCategory(cat)}
                        className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold transition-all ${rackCategory === cat ? 'bg-coquette-600 text-white shadow-md' : 'bg-white border border-coquette-100 text-coquette-400 hover:bg-coquette-50'}`}
                      >
                        {cat}
                      </button>
                    ))}
                 </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 bg-lace grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 content-start">
                 {filteredRackItems.map(item => (
                   <div key={item.id} onClick={() => handleRackSelect(item)} className="cursor-pointer group h-fit">
                      <div className="aspect-[3/4] rounded-xl overflow-hidden border-2 border-white group-hover:border-coquette-400 shadow-sm relative bg-white">
                         <img src={item.image} className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                         <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 bg-white text-coquette-600 p-1.5 rounded-full shadow-sm transition-opacity">
                            <Plus size={14} />
                         </div>
                      </div>
                      <p className="text-xs text-center mt-2 font-serif truncate text-coquette-800">{item.name}</p>
                   </div>
                 ))}
                 
                 {filteredRackItems.length === 0 && (
                   <div className="col-span-full flex flex-col items-center justify-center py-10 text-coquette-400">
                     <Filter size={32} className="mb-2 opacity-50" />
                     <p className="text-center font-serif text-lg">No items found in {rackCategory === 'All' ? 'your closet' : 'this category'}.</p>
                     {closetItems.length === 0 && (
                        <p className="text-xs mt-1">Go to "Digital Closet" to add items first.</p>
                     )}
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CampusThrift;
