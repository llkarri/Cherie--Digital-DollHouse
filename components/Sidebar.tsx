
import React from 'react';
import { LayoutGrid, Ruler, Gem, Shirt, ListChecks, Heart, Plane, Store, Palette, Calendar, User, X, Sparkles } from 'lucide-react';
import { Section } from '../types';

interface SidebarProps {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection, isOpen, toggleSidebar }) => {
  // Reordered: Campus Thrift before Weekly Planner (Journal)
  const menuItems = [
    { id: 'digital-closet' as Section, label: 'My Digital Closet', icon: Shirt, emoji: '🎀' },
    { id: 'dressing-room' as Section, label: 'The Dressing Room', icon: Palette, emoji: '👗' },
    { id: 'closet' as Section, label: 'Playhouse Styling', icon: LayoutGrid, emoji: '🩰' },
    { id: 'shopping-guide' as Section, label: 'Wishlist', icon: ListChecks, emoji: '🦢' },
    { id: 'body' as Section, label: 'Silhouette Studio', icon: Ruler, emoji: '🕯️' },
    { id: 'luxury' as Section, label: 'Luxury & Pearls', icon: Gem, emoji: '🪞' },
    { id: 'travel' as Section, label: 'Pack for a Trip', icon: Plane, emoji: '🧳' },
    { id: 'thrift' as Section, label: 'Campus Thrift', icon: Store, emoji: '🏷️' },
    { id: 'planner' as Section, label: 'Weekly Journal', icon: Calendar, emoji: '📅' },
    { id: 'profile' as Section, label: 'My Profile', icon: User, emoji: '👸' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-coquette-900/20 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
        aria-hidden="true"
      />

      {/* Sidebar Content */}
      <aside 
        className={`
          fixed top-0 h-full z-50 w-72 
          right-0 md:left-0 md:right-auto
          bg-coquette-50 md:bg-cream md:bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]
          border-l-2 md:border-l-0 md:border-r-2 border-coquette-200 
          shadow-[-4px_0_24px_rgba(128,0,32,0.1)] md:shadow-[4px_0_24px_rgba(128,0,32,0.1)]
          transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}
        aria-label="Main Sidebar Navigation"
      >
        {/* Mobile Close Button */}
        <button 
          onClick={toggleSidebar}
          className="absolute top-6 right-6 text-coquette-900 md:hidden z-50 p-2 bg-white/50 rounded-full hover:bg-white transition-colors"
          aria-label="Close Menu"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col h-full p-8 relative overflow-hidden">
          {/* Decorative Ribbon Top */}
          <div className="absolute top-0 left-8 right-8 h-4 bg-coquette-200 rounded-b-lg shadow-sm opacity-50" aria-hidden="true"></div>

          <div className="mb-12 mt-4 flex flex-col items-center text-center gap-2 relative z-10">
             <div className="w-16 h-16 bg-coquette-50 rounded-full border-2 border-coquette-200 flex items-center justify-center text-coquette-600 shadow-inner mb-2 animate-float">
               <Heart size={28} fill="#F472B6" stroke="none" />
             </div>
             <div>
               <h1 className="font-serif text-4xl font-bold tracking-tight text-coquette-900 drop-shadow-sm">Cherie.</h1>
               <p className="font-sans text-xs uppercase tracking-[0.3em] text-coquette-600 mt-1">Digital Dollhouse</p>
            </div>
          </div>

          <nav className="flex-1 relative z-10 overflow-y-auto custom-scrollbar pr-2" aria-label="Main Navigation">
            <ul className="space-y-3">
              {menuItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveSection(item.id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`
                        w-full flex items-center gap-4 p-3 px-5 text-sm font-sans transition-all duration-300 rounded-full group btn-press
                        ${isActive 
                          ? 'bg-coquette-600 text-white shadow-md shadow-coquette-300 transform scale-105' 
                          : 'text-coquette-800 hover:bg-coquette-100 hover:text-coquette-900 border border-transparent hover:border-coquette-200'}
                      `}
                    >
                      <span className="text-lg filter drop-shadow-sm group-hover:scale-125 transition-transform duration-300" aria-hidden="true">{item.emoji}</span>
                      <span className={`tracking-wide font-medium ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
                      {isActive && <Sparkles size={14} className="ml-auto animate-pulse" aria-hidden="true" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="pt-8 border-t border-coquette-200/50 text-center relative z-10">
             <p className="font-serif italic text-coquette-400 text-xs flex items-center justify-center gap-2">
               Made with love <Heart size={10} fill="currentColor" aria-hidden="true" /> Gemini 3
             </p>
          </div>
          
          {/* Bottom Pattern */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-coquette-600 opacity-10" aria-hidden="true"></div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
