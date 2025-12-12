import React, { useRef, useState } from 'react';
import { X, ScanEye, Info, Sparkles } from 'lucide-react';
import { analyzeBodyFit } from '../services/geminiService';
import { useGlobalState } from '../GlobalContext';
import VoiceInput from './VoiceInput';

const BodyTypeFit: React.FC = () => {
  const { bodyTypeFit, setBodyTypeFit } = useGlobalState();
  const { file, description, result } = bodyTypeFit;

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateState = (updates: Partial<typeof bodyTypeFit>) => {
    setBodyTypeFit(prev => ({ ...prev, ...updates }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      updateState({ file: e.target.files[0] });
    }
  };

  const handleAnalyze = async () => {
    if (!file && !description) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await analyzeBodyFit(file, description);
      updateState({ result: data });
    } catch (error) {
      setErrorMsg("Analysis could not be completed. Please ensure the image is clear or provide more details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fade-in pb-12">
      <div className="border-4 border-white shadow-lg pb-8 mb-8 text-center md:text-left relative overflow-hidden rounded-[3rem] p-10 bg-coquette-50">
        <img src="https://image.pollinations.ai/prompt/roman statues and flowers marble aesthetic pastel background?width=1000&height=200&nologo=true" className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none" />
        <div className="relative z-10">
            <h2 className="text-5xl font-serif text-coquette-900 mb-3 drop-shadow-sm">Silhouette Studio</h2>
            <p className="text-coquette-600 font-sans tracking-wide max-w-2xl bg-white/60 inline-block px-4 py-2 rounded-xl backdrop-blur-sm">
            Discover cuts that celebrate you. Let's find your perfect fit, darling.
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Input Column (4 cols) */}
        <div className="md:col-span-4 space-y-8">
          <div className="space-y-6 bg-white p-8 border border-coquette-100 shadow-md rounded-[2.5rem] relative">
             <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-1 bg-coquette-200 rounded-full"></div>

             {/* Image Input */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative w-full aspect-[3/4] border-2 border-coquette-200 
                flex flex-col items-center justify-center cursor-pointer 
                transition-all overflow-hidden bg-coquette-50 hover:border-coquette-400 rounded-[2rem]
                ${!file ? 'border-dashed' : 'border-solid'}
              `}
            >
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange}
              />
              
              {file ? (
                <>
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt="body analysis" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-colors" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); updateState({ file: null }); }}
                    className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg text-coquette-600"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <div className="text-center p-6">
                  <ScanEye className="w-10 h-10 mx-auto text-coquette-300 mb-4" />
                  <p className="font-serif text-coquette-800 text-xl">Upload Photo</p>
                  <p className="text-xs text-coquette-400 mt-2 uppercase tracking-widest">Full body preferred</p>
                </div>
              )}
            </div>

            {/* Text Input */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-coquette-400 font-bold ml-2">Describe Your Stats</label>
              <div className="relative">
                <textarea 
                  value={description}
                  onChange={(e) => updateState({ description: e.target.value })}
                  placeholder="e.g. 'I am 5'3, pear shaped, petite frame...'"
                  className="w-full p-4 bg-cream border border-coquette-200 focus:ring-2 focus:ring-coquette-300 focus:outline-none min-h-[120px] font-sans text-sm resize-none rounded-2xl text-coquette-800 placeholder-coquette-300"
                />
                <div className="absolute right-3 bottom-3">
                  <VoiceInput onTranscript={(t) => updateState({ description: description + " " + t })} />
                </div>
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={(!file && !description) || isLoading}
              className="w-full py-4 bg-coquette-600 text-white font-serif uppercase tracking-widest text-xs hover:bg-coquette-800 disabled:opacity-50 transition-colors rounded-full shadow-lg btn-press"
            >
              {isLoading ? "Analyzing..." : "Analyze Silhouette"}
            </button>
          </div>
        </div>

        {/* Results Column (8 cols) */}
        <div className="md:col-span-8">
           {errorMsg && (
            <div className="p-4 bg-red-50 text-red-800 text-sm mb-4 border border-red-100 rounded-xl">{errorMsg}</div>
          )}

          {result ? (
            <div className="space-y-8 animate-fade-in">
              {/* Header Analysis */}
              <div className="bg-gradient-to-r from-coquette-500 to-coquette-600 text-white p-8 rounded-[2.5rem] shadow-lg border-4 border-white">
                <p className="text-xs uppercase tracking-[0.2em] opacity-80 mb-2 font-bold">Your Shape</p>
                <h3 className="text-4xl font-serif mb-4 flex items-center gap-3">
                    <Sparkles size={28} className="text-coquette-200" />
                    {result.body_shape}
                </h3>
                <p className="font-light leading-relaxed opacity-95 text-lg font-serif italic">{result.analysis}</p>
              </div>

              {/* Recommendations Grid */}
              <div className="grid grid-cols-1 gap-8">
                {result.recommendations?.map((rec, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row bg-white border border-coquette-100 shadow-md overflow-hidden min-h-[200px] rounded-[2.5rem] group hover:shadow-xl transition-all hover:-translate-y-1">
                    
                    {/* Visual Example */}
                    <div className="sm:w-1/3 h-56 sm:h-auto relative bg-coquette-100 overflow-hidden">
                      {/* Enriched prompt with user description to match height */}
                      <img 
                        src={`https://image.pollinations.ai/prompt/full body shot of woman ${description} wearing ${rec.visual_search_term} coquette fashion aesthetic soft lighting?width=400&height=600&nologo=true`} 
                        alt={rec.style_name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-end p-4">
                         <span className="text-white text-[10px] font-bold uppercase tracking-wider bg-white/20 px-3 py-1 backdrop-blur-md rounded-full border border-white/30">
                           {rec.style_name}
                         </span>
                      </div>
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 p-8 flex flex-col justify-center bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
                      <div className="mb-3 flex items-center gap-2">
                        <span className="text-[10px] font-bold bg-coquette-100 text-coquette-600 px-3 py-1 rounded-full uppercase tracking-wide border border-coquette-200">
                          {rec.category}
                        </span>
                      </div>
                      <h4 className="text-2xl font-serif text-coquette-900 mb-3">{rec.style_name}</h4>
                      <p className="text-coquette-700 text-sm leading-relaxed font-sans">{rec.reasoning}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
             <div className="h-full border-4 border-dotted border-coquette-200 bg-white/50 flex flex-col items-center justify-center text-center p-12 text-coquette-400 opacity-80 rounded-[3rem]">
               <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <Info size={32} strokeWidth={1.5} className="text-coquette-300" />
               </div>
               <p className="font-serif text-3xl italic mb-2 text-coquette-800">The Fitting Room</p>
               <p className="text-sm font-sans max-w-xs">Analysis and style secrets will appear here.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BodyTypeFit;