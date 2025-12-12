
import React from 'react';
import { Shirt, Store, PlusCircle, Calendar, User } from 'lucide-react';
import { Section } from '../types';

interface BottomNavProps {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeSection, setActiveSection }) => {
  const navItems = [
    { id: 'digital-closet' as Section, label: 'Closet', icon: Shirt },
    { id: 'thrift' as Section, label: 'Shop', icon: Store },
    { id: 'add' as any, label: 'Add', icon: PlusCircle, special: true }, // Special handler
    { id: 'planner' as Section, label: 'Plan', icon: Calendar },
    { id: 'profile' as Section, label: 'Me', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-coquette-100 z-50 px-4 pt-2 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.05)] transition-all" aria-label="Mobile Navigation">
      <div className="flex justify-between items-end pb-1">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          
          if (item.special) {
             return (
               <button 
                 key={item.label}
                 onClick={() => setActiveSection('digital-closet')} 
                 className="relative -top-6 group"
                 aria-label="Add New Item"
               >
                 <div className="w-16 h-16 bg-gradient-to-br from-coquette-500 to-coquette-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-coquette-200 transform transition-transform active:scale-95 border-4 border-white">
                    <PlusCircle size={32} />
                 </div>
                 <span className="text-[10px] font-bold tracking-wide text-coquette-800 absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-active:opacity-100 transition-opacity">Add</span>
               </button>
             )
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as Section)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center gap-1 p-2 min-w-[64px] transition-all rounded-xl active:bg-coquette-50 ${isActive ? 'text-coquette-600' : 'text-coquette-400'}`}
            >
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} aria-hidden="true" />
              <span className={`text-[10px] font-bold tracking-wide transition-colors ${isActive ? 'text-coquette-800' : 'text-coquette-300'}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
