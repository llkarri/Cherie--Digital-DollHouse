
import React, { useState } from 'react';
import { Calendar, Plus, X, Shirt } from 'lucide-react';
import { useCloset } from '../hooks/useCloset';
import { DayOfWeek, ClosetItem, Category } from '../types';

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const CATEGORIES: Category[] = ['Top', 'Bottom', 'Dress', 'Shoes', 'Bag', 'Accessory', 'Outerwear'];

const WeeklyPlanner: React.FC = () => {
  const { closetItems, plannerEntries, updatePlanner } = useCloset();
  const [activeDay, setActiveDay] = useState<DayOfWeek | null>(null);
  
  // Selection Modal State
  const [categoryFilter, setCategoryFilter] = useState<Category | 'All'>('All');

  const handleAddItem = (itemId: string) => {
    if (!activeDay) return;
    const currentItems = plannerEntries[activeDay] || [];
    // Prevent duplicates
    if (!currentItems.includes(itemId)) {
      updatePlanner(activeDay, [...currentItems, itemId]);
    }
    // Don't close modal automatically, allow multiple selections
  };

  const handleRemoveItem = (day: DayOfWeek, itemId: string) => {
    const currentItems = plannerEntries[day] || [];
    updatePlanner(day, currentItems.filter(id => id !== itemId));
  };

  const getDayItems = (day: DayOfWeek) => {
    const ids = plannerEntries[day] || [];
    return ids.map(id => closetItems.find(item => item.id === id)).filter(Boolean) as ClosetItem[];
  };

  const filteredClosetItems = categoryFilter === 'All' 
    ? closetItems 
    : closetItems.filter(item => item.category === categoryFilter);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-32">
       {/* Header */}
       <div className="relative bg-white border-2 border-coquette-100 rounded-[3rem] p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5">
             <Calendar size={200} className="text-coquette-900" />
          </div>
          <div className="relative z-10 text-center md:text-left">
            <h2 className="text-5xl font-serif text-coquette-900 mb-2">Weekly Journal</h2>
            <p className="text-coquette-500 font-sans tracking-wide">Plan your outfits, manifest your vibe.</p>
          </div>
       </div>

       {/* Days Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {DAYS.map((day) => {
            const items = getDayItems(day);
            return (
              <div key={day} className="flex flex-col h-[400px] bg-cream rounded-[2.5rem] shadow-md border-2 border-white overflow-hidden relative group transition-transform hover:-translate-y-1">
                 {/* Paper Header */}
                 <div className="bg-white border-b border-coquette-100 p-4 text-center">
                    <h3 className="font-serif text-2xl text-coquette-900">{day}</h3>
                 </div>
                 
                 {/* Content - Lined Paper Look */}
                 <div 
                   className="flex-1 p-4 bg-[linear-gradient(transparent_23px,#FBCFE8_24px)] bg-[length:100%_24px] overflow-y-auto custom-scrollbar"
                 >
                    {items.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {items.map(item => (
                          <div key={item.id} className="relative group/item aspect-[3/4] bg-white rounded-xl p-1 shadow-sm border border-coquette-50">
                             <img src={item.image} className="w-full h-full object-cover rounded-lg" />
                             <button 
                               onClick={() => handleRemoveItem(day, item.id)}
                               className="absolute -top-1 -right-1 bg-red-100 text-red-500 rounded-full p-1 opacity-0 group-hover/item:opacity-100 transition-opacity shadow-sm"
                             >
                               <X size={10} />
                             </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center opacity-40">
                         <Shirt size={32} className="text-coquette-300 mb-2" />
                         <span className="font-serif italic text-coquette-400">Rest Day</span>
                      </div>
                    )}
                 </div>

                 {/* Add Button */}
                 <div className="p-3 bg-white border-t border-coquette-100 flex justify-center">
                    <button 
                      onClick={() => setActiveDay(day)}
                      className="w-full py-2 bg-coquette-50 text-coquette-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-coquette-600 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={14} /> Style
                    </button>
                 </div>
              </div>
            );
          })}
       </div>

       {/* Selection Modal */}
       {activeDay && (
         <div className="fixed inset-0 bg-coquette-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl h-[80vh] rounded-[3rem] shadow-2xl flex flex-col border-[6px] border-white animate-pop overflow-hidden">
               {/* Modal Header */}
               <div className="p-6 border-b border-coquette-100 bg-coquette-50/50 flex justify-between items-center">
                  <div>
                    <h3 className="font-serif text-3xl text-coquette-900">Styling {activeDay}</h3>
                    <p className="text-xs text-coquette-500 uppercase tracking-widest font-bold">Tap items to add to your plan</p>
                  </div>
                  <button onClick={() => setActiveDay(null)} className="p-2 bg-white rounded-full text-coquette-400 hover:text-coquette-900 shadow-sm"><X size={20}/></button>
               </div>

               {/* Filter Bar */}
               <div className="px-6 py-3 bg-white border-b border-coquette-50 flex gap-2 overflow-x-auto no-scrollbar">
                  <button 
                    onClick={() => setCategoryFilter('All')}
                    className={`px-4 py-1.5 rounded-full text-[10px] uppercase font-bold transition-all border ${categoryFilter === 'All' ? 'bg-coquette-600 text-white border-coquette-600' : 'text-coquette-400 border-coquette-100 hover:border-coquette-300'}`}
                  >
                    All
                  </button>
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-4 py-1.5 rounded-full text-[10px] uppercase font-bold transition-all border ${categoryFilter === cat ? 'bg-coquette-600 text-white border-coquette-600' : 'text-coquette-400 border-coquette-100 hover:border-coquette-300'}`}
                    >
                      {cat}
                    </button>
                  ))}
               </div>

               {/* Grid */}
               <div className="flex-1 overflow-y-auto p-6 bg-lace">
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                     {filteredClosetItems.map(item => {
                        const isSelected = plannerEntries[activeDay]?.includes(item.id);
                        return (
                          <div 
                            key={item.id}
                            onClick={() => isSelected ? handleRemoveItem(activeDay, item.id) : handleAddItem(item.id)}
                            className={`
                              aspect-[3/4] rounded-xl overflow-hidden cursor-pointer relative transition-all border-2
                              ${isSelected ? 'border-coquette-600 ring-2 ring-coquette-200 transform scale-95' : 'border-white hover:border-coquette-300'}
                            `}
                          >
                             <img src={item.image} className="w-full h-full object-cover" />
                             {isSelected && (
                               <div className="absolute inset-0 bg-coquette-600/20 flex items-center justify-center">
                                  <div className="bg-coquette-600 text-white p-1 rounded-full"><Plus size={16} className="rotate-45" /></div>
                               </div>
                             )}
                          </div>
                        );
                     })}
                  </div>
               </div>
               
               <div className="p-4 bg-white border-t border-coquette-100 text-center">
                  <button onClick={() => setActiveDay(null)} className="px-8 py-3 bg-coquette-600 text-white rounded-full font-serif text-lg hover:bg-coquette-800 transition-colors shadow-lg">Done</button>
               </div>
            </div>
         </div>
       )}
    </div>
  );
};

export default WeeklyPlanner;
