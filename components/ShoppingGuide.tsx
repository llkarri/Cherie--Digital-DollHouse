import React, { useState } from 'react';
import { Search, Plus, Trash2 } from 'lucide-react';
import { useCloset } from '../hooks/useCloset';
import { Season, WishlistItem } from '../types';

const SEASON_COLS: { label: string; value: Season }[] = [
  { label: 'Spring Bloom', value: 'Spring' },
  { label: 'Summer Days', value: 'Summer' },
  { label: 'Autumn Cozy', value: 'Autumn' },
  { label: 'Winter Frost', value: 'Winter' },
];

const ShoppingGuide: React.FC = () => {
  const { wishlistItems, updateWishlist } = useCloset();
  const [inputs, setInputs] = useState<Record<string, string>>({});

  const handleInputChange = (season: string, value: string) => {
    setInputs(prev => ({ ...prev, [season]: value }));
  };

  const addItem = (season: Season) => {
    const name = inputs[season]?.trim();
    if (!name) return;

    const newItem: WishlistItem = {
      id: Date.now().toString(),
      name: name,
      season: season,
      isPurchased: false
    };

    updateWishlist([...wishlistItems, newItem]);
    setInputs(prev => ({ ...prev, [season]: '' }));
  };

  const removeItem = (id: string) => {
    const updated = wishlistItems.filter(item => item.id !== id);
    updateWishlist(updated);
  };

  const toggleCheck = (id: string) => {
    const updated = wishlistItems.map(item => 
      item.id === id ? { ...item, isPurchased: !item.isPurchased } : item
    );
    updateWishlist(updated);
  };

  const openShoppingSearch = (itemName: string) => {
    const query = encodeURIComponent(itemName);
    window.open(`https://www.google.com/search?tbm=shop&q=${query}`, '_blank');
  };

  const handleKeyDown = (e: React.KeyboardEvent, season: Season) => {
    if (e.key === 'Enter') {
      addItem(season);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto animate-fade-in pb-20">
      <div className="border-b border-coquette-200 pb-8 mb-8 text-center md:text-left relative overflow-hidden rounded-[3rem] bg-cream px-10 pt-10">
         <div className="absolute top-0 right-0 opacity-20 transform rotate-12">
            <span className="text-[10rem]">🦢</span>
         </div>
        <h2 className="text-5xl font-serif text-coquette-900 mb-3 relative z-10">Seasonal Wishes</h2>
        <p className="text-coquette-500 font-sans tracking-wide relative z-10 bg-white/50 inline-block px-3 py-1 rounded-full">Curate your dream list for every season.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {SEASON_COLS.map((col) => {
          const seasonItems = wishlistItems.filter(item => item.season === col.value);
          
          return (
            <div key={col.value} className="flex flex-col bg-white border-2 border-white h-[75vh] shadow-lg rounded-[2.5rem] overflow-hidden transform hover:-translate-y-1 transition-transform duration-500">
              {/* Header */}
              <div className="p-8 border-b border-coquette-100 bg-coquette-50/50">
                <h3 className="font-serif text-3xl text-coquette-900 italic">{col.label}</h3>
                <div className="h-1 w-10 bg-coquette-300 rounded-full mt-2"></div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
                {seasonItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="group flex flex-col p-4 bg-white/80 backdrop-blur-sm border border-transparent hover:border-coquette-200 transition-all rounded-2xl shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => toggleCheck(item.id)}
                        className={`
                          mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
                          ${item.isPurchased ? 'bg-coquette-600 border-coquette-600 scale-110' : 'border-coquette-200 hover:border-coquette-400'}
                        `}
                      >
                         {item.isPurchased && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <span className={`block font-serif text-xl leading-tight truncate transition-all ${item.isPurchased ? 'line-through text-coquette-300' : 'text-coquette-800'}`}>
                          {item.name}
                        </span>
                      </div>
                    </div>

                    {/* Actions Row (Visible on Hover/Focus) */}
                    <div className="flex items-center gap-2 mt-3 pl-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openShoppingSearch(item.name)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-coquette-100 text-coquette-800 text-[9px] uppercase tracking-wider font-bold hover:bg-coquette-600 hover:text-white transition-colors rounded-full"
                      >
                        <Search size={10} />
                        Find
                      </button>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-coquette-300 hover:text-red-500 transition-colors"
                        title="Remove"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
                
                {seasonItems.length === 0 && (
                  <div className="p-8 text-center opacity-40 mt-10">
                    <span className="text-4xl block mb-2">✨</span>
                    <p className="font-serif italic text-coquette-400 text-xl">Make a wish...</p>
                  </div>
                )}
              </div>

              {/* Input Footer */}
              <div className="p-4 border-t border-coquette-100 bg-white">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={inputs[col.value] || ''}
                    onChange={(e) => handleInputChange(col.value, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, col.value)}
                    placeholder="Add item..."
                    className="w-full bg-coquette-50/50 border border-coquette-100 p-4 pr-12 text-sm focus:outline-none focus:border-coquette-300 font-serif text-lg rounded-2xl text-coquette-900 placeholder-coquette-300"
                  />
                  <button 
                    onClick={() => addItem(col.value)}
                    disabled={!inputs[col.value]}
                    className="absolute right-3 p-2 bg-white text-coquette-600 rounded-xl shadow-sm hover:bg-coquette-600 hover:text-white transition-colors disabled:opacity-0"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShoppingGuide;