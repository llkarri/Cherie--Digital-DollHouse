
import React, { useState } from 'react';
import { useCloset } from '../hooks/useCloset';
import { User, Settings, Heart, DollarSign, Tag, Moon, Bell, Globe } from 'lucide-react';

const Profile: React.FC = () => {
  const { userProfile, updateProfile, getTotalValue, closetItems } = useCloset();
  const [isEditing, setIsEditing] = useState(false);

  // Stats
  const totalItems = closetItems.length;
  const totalValue = getTotalValue();
  const itemsForSale = closetItems.filter(i => i.forSale).length;

  // Mock Settings State
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-32">
       
       {/* Top Profile Card */}
       <div className="bg-white rounded-[3rem] p-8 border-2 border-coquette-100 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-coquette-50 z-0"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 mt-12">
             <div className="w-32 h-32 rounded-full bg-cream border-4 border-white shadow-md flex items-center justify-center text-4xl overflow-hidden relative group">
                {/* Avatar Placeholder */}
                <span className="group-hover:opacity-0 transition-opacity" role="img" aria-label="User Avatar">👸</span>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  aria-label="Edit Profile Picture"
                  className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold cursor-pointer border-none"
                >
                  EDIT
                </button>
             </div>
             
             <div className="flex-1 text-center md:text-left mb-2">
                {isEditing ? (
                  <input 
                    type="text" 
                    value={userProfile.name}
                    onChange={(e) => updateProfile({...userProfile, name: e.target.value})}
                    aria-label="Edit Name"
                    className="font-serif text-4xl text-coquette-900 bg-transparent border-b-2 border-coquette-300 focus:outline-none w-full md:w-auto"
                  />
                ) : (
                  <h1 className="font-serif text-4xl text-coquette-900">{userProfile.name}</h1>
                )}
                <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                   <span className="px-3 py-1 bg-white/60 rounded-full text-xs font-bold uppercase tracking-wider text-coquette-500 border border-coquette-100">
                     {userProfile.styleGoal}
                   </span>
                </div>
             </div>

             <button 
               onClick={() => setIsEditing(!isEditing)}
               className="px-6 py-2 bg-coquette-600 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-coquette-800 transition-colors shadow-md"
               aria-pressed={isEditing}
             >
               {isEditing ? 'Save Profile' : 'Edit Profile'}
             </button>
          </div>

          {/* User Details Form (Visible when Editing) */}
          {isEditing && (
             <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-up">
                <div>
                   <label htmlFor="styleGoal" className="text-[10px] uppercase font-bold text-coquette-400 block mb-1">Style Archetype</label>
                   <input 
                     id="styleGoal"
                     type="text"
                     value={userProfile.styleGoal}
                     onChange={(e) => updateProfile({...userProfile, styleGoal: e.target.value})}
                     className="w-full bg-coquette-50/30 border border-coquette-100 rounded-xl px-4 py-2 text-coquette-900 font-serif"
                   />
                </div>
                <div className="grid grid-cols-3 gap-4">
                   <div>
                     <label htmlFor="topSize" className="text-[10px] uppercase font-bold text-coquette-400 block mb-1">Top Size</label>
                     <input 
                       id="topSize"
                       type="text"
                       value={userProfile.sizes.top}
                       onChange={(e) => updateProfile({...userProfile, sizes: {...userProfile.sizes, top: e.target.value}})}
                       className="w-full bg-coquette-50/30 border border-coquette-100 rounded-xl px-4 py-2 text-center font-bold text-coquette-800"
                     />
                   </div>
                   <div>
                     <label htmlFor="bottomSize" className="text-[10px] uppercase font-bold text-coquette-400 block mb-1">Bottom</label>
                     <input 
                       id="bottomSize"
                       type="text"
                       value={userProfile.sizes.bottom}
                       onChange={(e) => updateProfile({...userProfile, sizes: {...userProfile.sizes, bottom: e.target.value}})}
                       className="w-full bg-coquette-50/30 border border-coquette-100 rounded-xl px-4 py-2 text-center font-bold text-coquette-800"
                     />
                   </div>
                   <div>
                     <label htmlFor="shoeSize" className="text-[10px] uppercase font-bold text-coquette-400 block mb-1">Shoe</label>
                     <input 
                       id="shoeSize"
                       type="text"
                       value={userProfile.sizes.shoe}
                       onChange={(e) => updateProfile({...userProfile, sizes: {...userProfile.sizes, shoe: e.target.value}})}
                       className="w-full bg-coquette-50/30 border border-coquette-100 rounded-xl px-4 py-2 text-center font-bold text-coquette-800"
                     />
                   </div>
                </div>
             </div>
          )}
       </div>

       {/* Dashboard Stats */}
       <div className="grid grid-cols-3 gap-4" role="region" aria-label="Closet Statistics">
          <div className="bg-cream p-6 rounded-[2rem] border border-white shadow-sm text-center flex flex-col items-center justify-center">
             <div className="mb-2 p-2 bg-white rounded-full text-coquette-400"><DollarSign size={20} /></div>
             <p className="font-serif text-2xl text-coquette-900">${totalValue.toLocaleString()}</p>
             <p className="text-[9px] uppercase tracking-widest text-coquette-400 font-bold mt-1">Closet Value</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-coquette-100 shadow-sm text-center flex flex-col items-center justify-center">
             <div className="mb-2 p-2 bg-coquette-50 rounded-full text-coquette-500"><Tag size={20} /></div>
             <p className="font-serif text-2xl text-coquette-900">{totalItems}</p>
             <p className="text-[9px] uppercase tracking-widest text-coquette-400 font-bold mt-1">Total Items</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-coquette-100 shadow-sm text-center flex flex-col items-center justify-center">
             <div className="mb-2 p-2 bg-coquette-50 rounded-full text-coquette-500"><Settings size={20} /></div>
             <p className="font-serif text-2xl text-coquette-900">{itemsForSale}</p>
             <p className="text-[9px] uppercase tracking-widest text-coquette-400 font-bold mt-1">Listed For Sale</p>
          </div>
       </div>

       {/* App Settings */}
       <div className="bg-white rounded-[2.5rem] p-8 border border-coquette-100 shadow-sm">
          <h3 className="font-serif text-2xl text-coquette-900 mb-6 flex items-center gap-2">
            <Settings size={20} /> App Settings
          </h3>
          
          <div className="space-y-6">
             <div className="flex items-center justify-between pb-4 border-b border-coquette-50">
                <div className="flex items-center gap-3">
                   <div className="bg-coquette-50 p-2 rounded-lg text-coquette-600"><Moon size={18} /></div>
                   <span className="font-sans font-medium text-coquette-800" id="dark-mode-label">Dark Mode</span>
                </div>
                <button 
                  role="switch"
                  aria-checked={darkMode}
                  aria-labelledby="dark-mode-label"
                  onClick={() => setDarkMode(!darkMode)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${darkMode ? 'bg-coquette-600' : 'bg-gray-200'}`}
                >
                   <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${darkMode ? 'left-7' : 'left-1'}`}></div>
                </button>
             </div>

             <div className="flex items-center justify-between pb-4 border-b border-coquette-50">
                <div className="flex items-center gap-3">
                   <div className="bg-coquette-50 p-2 rounded-lg text-coquette-600"><Bell size={18} /></div>
                   <span className="font-sans font-medium text-coquette-800" id="notifications-label">Notifications</span>
                </div>
                <button 
                  role="switch"
                  aria-checked={notifications}
                  aria-labelledby="notifications-label"
                  onClick={() => setNotifications(!notifications)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? 'bg-coquette-600' : 'bg-gray-200'}`}
                >
                   <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${notifications ? 'left-7' : 'left-1'}`}></div>
                </button>
             </div>

             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="bg-coquette-50 p-2 rounded-lg text-coquette-600"><Globe size={18} /></div>
                   <span className="font-sans font-medium text-coquette-800">Currency</span>
                </div>
                <div className="flex bg-coquette-50 rounded-lg p-1" role="group" aria-label="Currency Selection">
                   {['$', '€', '£'].map(curr => (
                     <button key={curr} className="w-8 h-8 rounded-md bg-white shadow-sm text-xs font-bold text-coquette-900 focus:ring-2 focus:ring-coquette-200">{curr}</button>
                   ))}
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

export default Profile;
