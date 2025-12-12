
import React, { useState, useRef, useEffect } from 'react';
import { Send, Heart, Sparkles, User, Tag } from 'lucide-react';
import { chatLuxury } from '../services/geminiService';
import VoiceInput from './VoiceInput';
import ReactMarkdown from 'react-markdown';
import { Message, LuxuryRecommendation } from '../types';
import { useCloset } from '../hooks/useCloset';
import { useGlobalState } from '../GlobalContext';

const LuxuryInvestments: React.FC = () => {
  const { addToWishlist } = useCloset();
  const { luxuryInvestments, setLuxuryInvestments } = useGlobalState();
  const { messages, budget, userAge, userSize } = luxuryInvestments;
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const updateState = (updates: Partial<typeof luxuryInvestments>) => {
    setLuxuryInvestments(prev => ({ ...prev, ...updates }));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: 'user', text: input };
    updateState({ messages: [...messages, userMsg] });
    setInput('');
    setIsLoading(true);

    try {
      const data = await chatLuxury([...messages, userMsg], input, budget, userAge, userSize);
      const modelMsg: Message = {
        role: 'model',
        text: data.text,
        recommendations: data.recommendations
      };
      updateState({ messages: [...messages, userMsg, modelMsg] });
    } catch (error) {
      updateState({ messages: [...messages, userMsg, { role: 'model', text: "Oh dear, I'm having a little trouble connecting. Try again?" }] });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToWishlist = (item: LuxuryRecommendation) => {
    addToWishlist({
      id: Date.now().toString(),
      name: `${item.brand} ${item.name}`,
      season: 'Year-Round',
      isPurchased: false
    });
    // Add simple visual feedback logic if needed or just alert
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col animate-fade-in relative">
      
      {/* Decorative Elements */}
      <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/40 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header & Controls */}
      <div className="bg-white/80 backdrop-blur-md rounded-[3rem] p-8 border border-white shadow-sm mb-6 z-10 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          
          <div>
            <h2 className="text-4xl font-serif text-coquette-900 flex items-center gap-3">
              Luxury & Pearls
              <Sparkles size={24} className="text-coquette-400 animate-pulse-fast" />
            </h2>
            <p className="text-xs text-coquette-500 mt-2 uppercase tracking-widest font-bold">Your Investment Stylist</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-8 w-full md:w-auto items-end">
            {/* Age & Size Inputs - Minimalist */}
            <div className="flex gap-6">
              <div className="space-y-2 text-center">
                 <label className="text-[9px] uppercase font-bold text-coquette-400 flex items-center justify-center gap-1"><User size={10} /> Age</label>
                 <input 
                   type="text" 
                   value={userAge}
                   onChange={(e) => updateState({ userAge: e.target.value })}
                   className="w-16 border-b-2 border-coquette-200 bg-transparent text-lg font-serif text-coquette-800 focus:outline-none focus:border-coquette-600 text-center"
                 />
              </div>
              <div className="space-y-2 text-center">
                 <label className="text-[9px] uppercase font-bold text-coquette-400 flex items-center justify-center gap-1"><Tag size={10} /> Size</label>
                 <input 
                   type="text" 
                   value={userSize}
                   onChange={(e) => updateState({ userSize: e.target.value })}
                   className="w-24 border-b-2 border-coquette-200 bg-transparent text-lg font-serif text-coquette-800 focus:outline-none focus:border-coquette-600 text-center"
                 />
              </div>
            </div>

            {/* Budget Slider */}
            <div className="w-full sm:w-48">
              <div className="flex justify-between text-[9px] uppercase tracking-wider text-coquette-500 font-bold mb-3">
                <span>Access.</span>
                <span>Invest.</span>
                <span>Dream</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="2" 
                step="1"
                value={budget}
                onChange={(e) => updateState({ budget: parseInt(e.target.value) })}
                className="w-full h-1 bg-coquette-200 rounded-lg appearance-none cursor-pointer accent-coquette-600"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto mb-6 pr-2 space-y-8 p-4 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            
            {/* Text Bubble */}
            <div 
              className={`
                max-w-[85%] md:max-w-[70%] p-8 rounded-[2.5rem] text-sm leading-relaxed shadow-sm relative transition-all hover:-translate-y-1
                ${msg.role === 'user' 
                  ? 'bg-gradient-to-br from-coquette-400 to-coquette-600 text-white rounded-br-none' 
                  : 'bg-white border border-coquette-100 text-coquette-800 rounded-bl-none'}
              `}
            >
              {msg.role === 'model' && (
                 <div className="absolute -top-4 -left-4 bg-white p-1 rounded-full border border-coquette-100 shadow-sm animate-float">
                   <div className="w-10 h-10 bg-coquette-50 rounded-full flex items-center justify-center text-xl">👼</div>
                 </div>
              )}
              
              {msg.role === 'model' ? (
                <div className="prose prose-sm prose-pink font-sans max-w-none">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              ) : (
                <p className="font-sans font-medium text-lg">{msg.text}</p>
              )}
            </div>

            {/* Recommendations Cards (If any) */}
            {msg.recommendations && msg.recommendations.length > 0 && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full px-4">
                {msg.recommendations.map((rec, rIdx) => (
                  <div key={rIdx} className="bg-white rounded-[2rem] overflow-hidden border border-coquette-100 shadow-md group hover:shadow-xl transition-all transform hover:-translate-y-2">
                    <div className="h-56 overflow-hidden relative">
                      <img 
                        src={`https://image.pollinations.ai/prompt/${encodeURIComponent(rec.visual_description)}?width=400&height=400&nologo=true`} 
                        alt={rec.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-coquette-900 shadow-sm">
                        {rec.price_estimate}
                      </div>
                    </div>
                    <div className="p-5 flex flex-col gap-3">
                       <div>
                         <p className="text-[9px] uppercase tracking-widest text-coquette-400 font-bold mb-1">{rec.brand}</p>
                         <h4 className="font-serif text-xl text-coquette-900 leading-tight">{rec.name}</h4>
                       </div>
                       <button 
                         onClick={() => handleAddToWishlist(rec)}
                         className="mt-2 w-full py-3 bg-coquette-50 hover:bg-coquette-600 hover:text-white text-coquette-600 border border-coquette-200 rounded-xl transition-colors flex items-center justify-center gap-2 text-[10px] uppercase font-bold tracking-widest btn-press"
                       >
                         <Heart size={14} />
                         Add to Wishlist
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-coquette-100 px-6 py-4 rounded-full rounded-bl-none shadow-sm flex items-center space-x-2 ml-4">
               <span className="text-coquette-300 text-xs font-bold animate-pulse-fast">Thinking...</span>
               <div className="w-1.5 h-1.5 bg-coquette-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
               <div className="w-1.5 h-1.5 bg-coquette-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
               <div className="w-1.5 h-1.5 bg-coquette-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white/80 backdrop-blur-sm border-2 border-white p-3 flex items-center gap-3 rounded-[2rem] shadow-lg relative z-20">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me about a bag you're eyeing..."
          className="flex-1 bg-transparent border-none focus:ring-0 resize-none h-14 py-4 px-4 font-serif text-lg placeholder:font-sans placeholder:text-sm placeholder:text-coquette-300 text-coquette-900"
        />
        <div className="flex items-center gap-2 pr-2">
          <VoiceInput onTranscript={(t) => setInput(prev => prev + " " + t)} className="hover:bg-coquette-50 text-coquette-400" />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-coquette-500 to-coquette-600 text-white hover:from-coquette-600 hover:to-coquette-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-full shadow-md btn-press"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LuxuryInvestments;
