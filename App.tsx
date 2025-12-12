
import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import StyleMyCloset from './components/StyleMyCloset';
import BodyTypeFit from './components/BodyTypeFit';
import LuxuryInvestments from './components/LuxuryInvestments';
import DigitalCloset from './components/DigitalCloset';
import ShoppingGuide from './components/ShoppingGuide';
import TravelPacker from './components/TravelPacker';
import DressingRoom from './components/DressingRoom';
import CampusThrift from './components/CampusThrift';
import WeeklyPlanner from './components/WeeklyPlanner';
import Profile from './components/Profile';
import BottomNav from './components/BottomNav';
import { Section } from './types';
import { Menu } from 'lucide-react';

// Helper component defined OUTSIDE to prevent unmounting/remounting on every render
const SectionContainer = ({ 
  id, 
  activeSection, 
  children 
}: { 
  id: Section; 
  activeSection: Section; 
  children?: React.ReactNode 
}) => {
  // We use 'hidden' for non-active sections to keep them in the DOM (persisting state)
  // but invisible to the user.
  return (
    <div 
      style={{ display: activeSection === id ? 'block' : 'none' }}
      className={activeSection === id ? 'animate-fade-in' : ''}
      aria-hidden={activeSection !== id}
    >
      {children}
    </div>
  );
};

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>('digital-closet');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Store scroll positions for each section
  const scrollPositions = useRef<Record<string, number>>({});

  const handleSectionChange = (section: Section) => {
    // Save current scroll position before switching
    scrollPositions.current[activeSection] = window.scrollY;
    
    setActiveSection(section);
    setIsSidebarOpen(false); // Close sidebar on mobile when navigating
  };

  // Restore scroll position after activeSection updates
  useEffect(() => {
    const savedPosition = scrollPositions.current[activeSection] || 0;
    // Immediate scroll restoration
    window.scrollTo({ top: savedPosition, behavior: 'instant' });
  }, [activeSection]);

  return (
    <div className="min-h-screen bg-lace text-coquette-900 font-sans selection:bg-coquette-200 selection:text-coquette-900">
      
      {/* Mobile Header - Visible on Mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-cream/90 backdrop-blur-md z-30 flex items-center justify-between px-6 border-b border-coquette-200 shadow-sm transition-all duration-300">
        <span className="font-serif text-2xl font-bold text-coquette-900 tracking-wide">Cherie.</span>
        <button 
          onClick={() => setIsSidebarOpen(true)} 
          className="text-coquette-900 p-2 rounded-full hover:bg-coquette-100 transition-colors"
          aria-label="Open Menu"
        >
          <Menu size={28} />
        </button>
      </div>

      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={handleSectionChange}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <main 
        className="
          transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
          md:ml-72 min-h-screen
          px-6 py-24 md:px-12 md:py-12
          pb-24 md:pb-12 /* Extra padding bottom for mobile nav */
        "
      >
        <div className="max-w-7xl mx-auto">
          {/* 
            We render ALL components to preserve their state (inputs, canvas items, etc.)
            and simply toggle visibility with CSS via SectionContainer. 
          */}
          <SectionContainer id="digital-closet" activeSection={activeSection}><DigitalCloset /></SectionContainer>
          <SectionContainer id="shopping-guide" activeSection={activeSection}><ShoppingGuide /></SectionContainer>
          <SectionContainer id="closet" activeSection={activeSection}><StyleMyCloset /></SectionContainer>
          <SectionContainer id="body" activeSection={activeSection}><BodyTypeFit /></SectionContainer>
          <SectionContainer id="luxury" activeSection={activeSection}><LuxuryInvestments /></SectionContainer>
          <SectionContainer id="travel" activeSection={activeSection}><TravelPacker /></SectionContainer>
          <SectionContainer id="dressing-room" activeSection={activeSection}><DressingRoom /></SectionContainer>
          <SectionContainer id="thrift" activeSection={activeSection}><CampusThrift /></SectionContainer>
          <SectionContainer id="planner" activeSection={activeSection}><WeeklyPlanner /></SectionContainer>
          <SectionContainer id="profile" activeSection={activeSection}><Profile /></SectionContainer>
        </div>
      </main>

      <BottomNav activeSection={activeSection} setActiveSection={handleSectionChange} />
    </div>
  );
};

export default App;
