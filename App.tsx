
import React, { useState, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import FittingControls from './components/FittingControls';
import { generateModelFit, editGeneratedImage } from './services/geminiService';
import { FittingConfig, GenerationState, StudioTier } from './types';

// Fix: Modified Window interface to make aistudio optional, ensuring compatibility with other potential declarations
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

const App: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [hasPersonalKey, setHasPersonalKey] = useState(false);
  const [activeTier, setActiveTier] = useState<StudioTier>('free');
  const [fittingConfig, setFittingConfig] = useState<FittingConfig>({
    modelType: 'female',
    modelRace: 'Diverse',
    pose: 'Shop Display',
    background: 'Clean',
    aspectRatio: '3:4',
    customInstructions: ''
  });
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    isEditing: false,
    error: null,
    resultUrl: null,
  });

  useEffect(() => {
    const checkKey = async () => {
      try {
        if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setHasPersonalKey(hasKey);
        }
      } catch (e) {
        console.warn("AIStudio bridge not available in this environment");
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    try {
      if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        await window.aistudio.openSelectKey();
        // Assume success to avoid race conditions as per instructions
        setHasPersonalKey(true);
        setActiveTier('pro');
        setState(prev => ({ ...prev, error: null }));
      } else {
        const msg = "API Key selection is only available within the AI Studio environment.";
        console.error(msg);
        setState(prev => ({ ...prev, error: msg }));
      }
    } catch (err: any) {
      console.error("Error opening key selection:", err);
      setState(prev => ({ ...prev, error: "Failed to open key selection dialog: " + err.message }));
    }
  };

  const toggleTier = async (tier: StudioTier) => {
    if (tier === 'pro' && !hasPersonalKey) {
      await handleSelectKey();
    } else {
      setActiveTier(tier);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;
    setState({ isGenerating: true, isEditing: false, error: null, resultUrl: null });
    setIsImageLoading(false);
    try {
      const result = await generateModelFit(selectedImage, fittingConfig, activeTier);
      setState({ isGenerating: false, isEditing: false, error: null, resultUrl: result });
      setIsImageLoading(true);
    } catch (err: any) {
      console.error("Generate Error:", err);
      if (err.message?.includes("Requested entity was not found.") || err.message?.includes("API Key must be set")) {
        setHasPersonalKey(false);
        setActiveTier('free');
        setState({ 
          isGenerating: false, 
          isEditing: false, 
          error: "Please select your personal API key to use Pro mode.", 
          resultUrl: null 
        });
      } else {
        setState({ isGenerating: false, isEditing: false, error: err.message, resultUrl: null });
      }
    }
  };

  const handleEdit = async () => {
    if (!state.resultUrl || !editPrompt.trim()) return;
    setState(prev => ({ ...prev, isEditing: true, error: null }));
    setIsImageLoading(false);
    try {
      const result = await editGeneratedImage(state.resultUrl, editPrompt, activeTier);
      setState({ isGenerating: false, isEditing: false, error: null, resultUrl: result });
      setIsImageLoading(true);
      setEditPrompt('');
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found.")) {
        setHasPersonalKey(false);
        setActiveTier('free');
      }
      setState(prev => ({ ...prev, isEditing: false, error: err.message }));
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col font-inter text-gray-800">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 py-6 px-8 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-6">
            <div className="flex flex-col items-center md:items-start">
              <h1 className="text-4xl font-brand font-black text-zimbabalooba-orange tracking-tighter uppercase leading-none">
                ZIMBABALOOBA
              </h1>
              <p className="text-[10px] text-zimbabalooba-teal font-extrabold uppercase tracking-[0.2em] mt-1">
                Photoshoot Generator
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="flex bg-gray-100 p-1 rounded-full border border-gray-200 shadow-inner">
              <button 
                onClick={() => toggleTier('free')}
                className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeTier === 'free' ? 'bg-white text-zimbabalooba-teal shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Free
              </button>
              <button 
                onClick={() => toggleTier('pro')}
                className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTier === 'pro' ? 'bg-zimbabalooba-orange text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <i className="fa-solid fa-sparkles"></i>
                Pro
              </button>
            </div>
            {activeTier === 'pro' && (
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noreferrer"
                className="text-[8px] text-gray-400 mt-1 hover:text-zimbabalooba-orange transition-colors"
              >
                Requires Personal API Key
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-xl shadow-zimbabalooba-teal/5 border border-gray-50">
            <h3 className="text-xs font-black text-zimbabalooba-teal uppercase tracking-widest mb-4">1. Studio Input</h3>
            <ImageUploader onImageSelected={setSelectedImage} selectedImage={selectedImage} />
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-xl shadow-zimbabalooba-teal/5 border border-gray-50">
            <h3 className="text-xs font-black text-zimbabalooba-teal uppercase tracking-widest mb-4">2. Shot Parameters</h3>
            <FittingControls config={fittingConfig} onChange={setFittingConfig} />
          </div>

          <button
            onClick={handleGenerate}
            disabled={!selectedImage || state.isGenerating || state.isEditing}
            className={`w-full py-5 px-8 rounded-full font-brand text-xl uppercase tracking-widest shadow-lg transition-all transform active:scale-95 border-b-4 
              ${!selectedImage || state.isGenerating || state.isEditing
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : activeTier === 'pro' 
                  ? 'bg-zimbabalooba-orange text-white border-amber-600 hover:bg-amber-500' 
                  : 'bg-zimbabalooba-teal text-white border-zimbabalooba-darkTeal hover:bg-zimbabalooba-darkTeal'
              }
            `}
          >
            {state.isGenerating ? (
              <span className="flex items-center justify-center">
                <i className="fa-solid fa-spinner fa-spin mr-3"></i> Developing...
              </span>
            ) : `Create ${activeTier === 'pro' ? 'HD' : ''} Photoshoot`}
          </button>
        </div>

        <div className="lg:col-span-8 flex flex-col space-y-6">
          <div className={`bg-white rounded-[2rem] border border-gray-100 shadow-2xl h-full min-h-[600px] flex flex-col overflow-hidden relative studio-grid transition-all duration-500 ${activeTier === 'pro' ? 'ring-2 ring-zimbabalooba-orange/20 shadow-orange-100' : ''}`}>
            <div className="border-b border-gray-100 p-6 flex items-center justify-between bg-white/95 backdrop-blur-sm z-20">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${state.resultUrl ? 'bg-zimbabalooba-orange shadow-[0_0_10px_rgba(255,176,0,0.5)] animate-pulse' : 'bg-gray-200'}`}></div>
                <h2 className="text-xs font-black text-zimbabalooba-teal uppercase tracking-[0.2em]">
                  {activeTier === 'pro' ? 'Pro HD Darkroom' : 'Digital Darkroom'}
                </h2>
              </div>
              {state.resultUrl && (
                <div className="flex space-x-3">
                  <button onClick={() => { if(state.resultUrl) { const l = document.createElement('a'); l.href=state.resultUrl; l.download='zimbabalooba.png'; l.click(); }}} className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 hover:border-zimbabalooba-orange rounded-full text-zimbabalooba-teal shadow-sm transition-all hover:scale-105" title="Download Image"><i className="fa-solid fa-download"></i></button>
                  <button onClick={() => { setSelectedImage(null); setState(p => ({...p, resultUrl: null})); }} className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 hover:border-rose-400 rounded-full text-rose-400 shadow-sm transition-all hover:scale-105" title="Reset"><i className="fa-solid fa-rotate-left"></i></button>
                </div>
              )}
            </div>

            <div className="flex-1 relative flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden">
              {state.error && (
                <div className="bg-white p-10 rounded-[2rem] shadow-2xl max-w-md text-center border-t-4 border-rose-400 z-30 animate-shake">
                  <div className="w-16 h-16 bg-rose-50 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-6"><i className="fa-solid fa-triangle-exclamation text-2xl"></i></div>
                  <h4 className="text-gray-800 font-bold mb-2">Notice</h4>
                  <p className="text-gray-500 text-[11px] mb-6 leading-relaxed">{state.error}</p>
                  <div className="flex flex-col gap-2">
                    <button onClick={handleSelectKey} className="w-full py-3 bg-zimbabalooba-teal text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-md">Select API Key</button>
                    <button onClick={() => setState(p => ({...p, error: null}))} className="px-6 py-2 text-gray-400 hover:text-gray-600 text-[10px] font-bold uppercase tracking-widest">Dismiss</button>
                  </div>
                </div>
              )}

              {(state.isGenerating || state.isEditing) && (
                <div className="text-center z-10 bg-white/60 backdrop-blur-lg p-12 rounded-[3rem] shadow-2xl border border-white/40">
                  <div className="mb-10 relative flex justify-center">
                    <div className="w-28 h-28 border-4 border-zimbabalooba-lightBg rounded-full"></div>
                    <div className={`absolute top-0 w-28 h-28 border-4 ${activeTier === 'pro' ? 'border-zimbabalooba-orange' : 'border-zimbabalooba-teal'} border-t-transparent rounded-full animate-spin`}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <i className={`fa-solid ${activeTier === 'pro' ? 'fa-wand-magic-sparkles' : 'fa-camera-retro'} text-zimbabalooba-teal text-3xl animate-pulse`}></i>
                    </div>
                  </div>
                  <h3 className="text-xl font-brand text-zimbabalooba-teal uppercase tracking-widest mb-2">
                    {state.isEditing ? 'Refining Shot...' : 'Developing Image...'}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    {activeTier === 'pro' ? 'Gemini 3 Pro Engine • 1K High-Res' : 'Gemini 2.5 Flash Engine • Standard Mode'}
                  </p>
                </div>
              )}

              {state.resultUrl && !state.isGenerating && !state.isEditing && (
                <div className="w-full h-full flex flex-col items-center">
                  <div className={`relative group max-h-[550px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] rounded-2xl overflow-hidden bg-white ring-8 ${activeTier === 'pro' ? 'ring-amber-50' : 'ring-white'}`}>
                    <img 
                      src={state.resultUrl} 
                      alt="Result" 
                      onLoad={() => setIsImageLoading(false)} 
                      className={`max-w-full max-h-[550px] object-contain transition-all duration-700 ${isImageLoading ? 'blur-xl opacity-0' : 'blur-0 opacity-100'}`} 
                    />
                    {activeTier === 'pro' && (
                      <div className="absolute top-4 right-4 bg-zimbabalooba-orange text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                        <i className="fa-solid fa-sparkles"></i> Pro HD
                      </div>
                    )}
                  </div>
                  
                  <div className="w-full max-w-xl mt-10">
                    <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-zimbabalooba-teal/5 flex items-center gap-3">
                      <div className="pl-4 text-zimbabalooba-teal/40"><i className="fa-solid fa-wand-magic-sparkles"></i></div>
                      <input 
                        type="text" 
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                        placeholder="Refine lighting, background or accessories..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-[11px] font-bold py-4 text-gray-700 placeholder:text-gray-300 uppercase tracking-tight"
                      />
                      <button 
                        onClick={handleEdit}
                        disabled={!editPrompt.trim()}
                        className={`px-8 py-4 rounded-xl font-brand uppercase tracking-[0.2em] text-xs transition-all
                          ${editPrompt.trim() 
                            ? activeTier === 'pro' ? 'bg-zimbabalooba-orange text-white shadow-orange-200 shadow-lg' : 'bg-zimbabalooba-teal text-white' 
                            : 'bg-gray-100 text-gray-300'}
                        `}
                      >
                        Refine
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {!state.resultUrl && !state.isGenerating && !state.isEditing && !state.error && (
                <div className="text-center max-w-sm">
                  <div className="w-24 h-24 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center mx-auto mb-8 border border-zimbabalooba-orange/20 rotate-6 hover:rotate-0 transition-transform duration-500">
                    <i className={`fa-solid ${activeTier === 'pro' ? 'fa-sparkles' : 'fa-wand-magic-sparkles'} text-zimbabalooba-orange text-4xl`}></i>
                  </div>
                  <h3 className="text-zimbabalooba-teal font-brand text-2xl uppercase tracking-wider mb-3">{activeTier === 'pro' ? 'Pro Studio' : 'Free Studio'}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed font-medium px-6">
                    {activeTier === 'pro' ? 'High-resolution professional modeling using the Gemini 3 Pro Engine.' : 'Fast, reliable generation using the Gemini 2.5 Flash Engine.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-10 text-center">
          <h4 className="text-2xl font-brand font-black text-zimbabalooba-teal tracking-tighter uppercase mb-3">ZIMBABALOOBA</h4>
          <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.5em] opacity-60">Hand-Dyed Cotton • Built for Adventure • Est. 2025</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
