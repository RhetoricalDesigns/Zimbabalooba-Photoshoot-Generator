
import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import FittingControls from './components/FittingControls';
import { generateModelFit, editGeneratedImage } from './services/geminiService';
import { FittingConfig, GenerationState } from './types';

const App: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
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

  const handleGenerate = async () => {
    if (!selectedImage) return;
    setState({ isGenerating: true, isEditing: false, error: null, resultUrl: null });
    setIsImageLoading(false);
    try {
      const result = await generateModelFit(selectedImage, fittingConfig);
      setState({ isGenerating: false, isEditing: false, error: null, resultUrl: result });
      setIsImageLoading(true);
    } catch (err: any) {
      setState({ isGenerating: false, isEditing: false, error: err.message, resultUrl: null });
    }
  };

  const handleEdit = async () => {
    if (!state.resultUrl || !editPrompt.trim()) return;
    setState(prev => ({ ...prev, isEditing: true, error: null }));
    setIsImageLoading(false);
    try {
      const result = await editGeneratedImage(state.resultUrl, editPrompt);
      setState({ isGenerating: false, isEditing: false, error: null, resultUrl: result });
      setIsImageLoading(true);
      setEditPrompt('');
    } catch (err: any) {
      setState(prev => ({ ...prev, isEditing: false, error: err.message }));
    }
  };

  const handleImageLoad = () => setIsImageLoading(false);
  const handleImageError = () => {
    setIsImageLoading(false);
    setState(prev => ({ ...prev, error: "Display failed. Image data may be restricted." }));
  };

  const reset = () => {
    setState({ isGenerating: false, isEditing: false, error: null, resultUrl: null });
    setSelectedImage(null);
    setEditPrompt('');
    setIsImageLoading(false);
  };

  const downloadImage = () => {
    if (!state.resultUrl) return;
    const link = document.createElement('a');
    link.href = state.resultUrl;
    link.download = `zimbabalooba-shot-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col font-inter text-gray-800">
      <header className="bg-white border-b border-gray-100 py-6 px-8 sticky top-0 z-50 shadow-sm">
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
          <div className="hidden lg:flex items-center">
            <p className="text-[11px] text-gray-400 font-medium italic text-right max-w-[250px]">
              "Crafted into clothing that celebrates the adventure that is your life."
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-xl shadow-zimbabalooba-teal/5 border border-gray-50">
            <ImageUploader onImageSelected={setSelectedImage} selectedImage={selectedImage} />
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-xl shadow-zimbabalooba-teal/5 border border-gray-50">
            <FittingControls config={fittingConfig} onChange={setFittingConfig} />
          </div>

          <button
            onClick={handleGenerate}
            disabled={!selectedImage || state.isGenerating || state.isEditing}
            className={`w-full py-5 px-8 rounded-full font-brand text-xl uppercase tracking-widest shadow-lg transition-all transform active:scale-95 border-b-4 border-zimbabalooba-darkTeal
              ${!selectedImage || state.isGenerating || state.isEditing
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-zimbabalooba-teal text-white hover:bg-zimbabalooba-darkTeal'
              }
            `}
          >
            {state.isGenerating ? (
              <span className="flex items-center justify-center">
                <i className="fa-solid fa-spinner fa-spin mr-3"></i> Processing...
              </span>
            ) : "Create Photoshoot"}
          </button>
        </div>

        <div className="lg:col-span-8 flex flex-col space-y-6">
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl h-full min-h-[600px] flex flex-col overflow-hidden relative">
            <div className="border-b border-gray-50 p-6 flex items-center justify-between bg-white/80 backdrop-blur-md z-10 sticky top-0">
              <div className="flex items-center space-x-3">
                <span className={`w-2 h-2 rounded-full ${state.resultUrl ? 'bg-zimbabalooba-orange animate-pulse' : 'bg-gray-200'}`}></span>
                <h2 className="text-sm font-black text-zimbabalooba-teal uppercase tracking-widest">Digital Darkroom</h2>
              </div>
              {state.resultUrl && !state.isGenerating && !state.isEditing && (
                <div className="flex space-x-2">
                  <button onClick={downloadImage} className="w-10 h-10 flex items-center justify-center hover:bg-zimbabalooba-lightBg rounded-full text-zimbabalooba-teal transition-all"><i className="fa-solid fa-download"></i></button>
                  <button onClick={reset} className="w-10 h-10 flex items-center justify-center hover:bg-rose-50 rounded-full text-rose-400 transition-all"><i className="fa-solid fa-rotate-left"></i></button>
                </div>
              )}
            </div>

            <div className="flex-1 relative flex flex-col items-center justify-center bg-gray-50/30 p-4 md:p-8 overflow-hidden">
              {!state.resultUrl && !state.isGenerating && !state.isEditing && !state.error && (
                <div className="text-center max-w-sm">
                  <div className="w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center mx-auto mb-6 border border-zimbabalooba-orange/10 rotate-3"><i className="fa-solid fa-mountain-sun text-zimbabalooba-orange text-3xl"></i></div>
                  <h3 className="text-zimbabalooba-teal font-brand text-xl uppercase tracking-wider mb-2">Ready for Adventure</h3>
                  <p className="text-gray-400 text-[11px] leading-relaxed font-medium px-4">Upload your hand-dyed Zimbabaloobas to begin.</p>
                </div>
              )}

              {(state.isGenerating || state.isEditing) && (
                <div className="text-center z-10">
                  <div className="mb-8 relative flex justify-center">
                    <div className="w-24 h-24 border-4 border-zimbabalooba-lightBg rounded-full"></div>
                    <div className="absolute top-0 w-24 h-24 border-4 border-zimbabalooba-orange border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center"><i className="fa-solid fa-camera-retro text-zimbabalooba-teal text-2xl animate-pulse"></i></div>
                  </div>
                  <h3 className="text-lg font-brand text-zimbabalooba-teal uppercase tracking-widest">{state.isEditing ? 'Editing Shot...' : 'Developing...'}</h3>
                </div>
              )}

              {state.error && (
                <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm text-center border-t-4 border-rose-400"><i className="fa-solid fa-triangle-exclamation text-rose-400 text-3xl mb-4"></i><p className="text-gray-500 text-xs font-medium">{state.error}</p></div>
              )}

              {state.resultUrl && !state.isGenerating && !state.isEditing && (
                <div className="w-full h-full flex flex-col items-center transition-all duration-700">
                  <div className="relative group max-h-[500px] shadow-2xl rounded-2xl overflow-hidden bg-white ring-1 ring-black/5">
                    <img src={state.resultUrl} alt="Photoshoot result" onLoad={handleImageLoad} onError={handleImageError} className={`max-w-full max-h-[500px] object-contain transition-opacity duration-500 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`} />
                    {isImageLoading && <div className="absolute inset-0 flex items-center justify-center bg-gray-50"><i className="fa-solid fa-circle-notch fa-spin text-zimbabalooba-orange text-2xl"></i></div>}
                  </div>
                  
                  {/* Prompt Space for Editing */}
                  <div className="w-full max-w-lg mt-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white p-2 rounded-2xl shadow-xl border border-zimbabalooba-teal/10 flex items-center gap-2">
                      <div className="pl-4 text-zimbabalooba-teal opacity-40"><i className="fa-solid fa-wand-magic-sparkles"></i></div>
                      <input 
                        type="text" 
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                        placeholder="Refine this shot... (e.g. Change shoes to red, make sunset brighter)"
                        className="flex-1 bg-transparent border-none focus:ring-0 text-xs font-medium py-3 text-gray-700 placeholder:text-gray-300"
                      />
                      <button 
                        onClick={handleEdit}
                        disabled={!editPrompt.trim()}
                        className={`px-6 py-3 rounded-xl font-brand uppercase tracking-widest text-[11px] transition-all
                          ${editPrompt.trim() ? 'bg-zimbabalooba-orange text-white shadow-lg' : 'bg-gray-100 text-gray-300'}
                        `}
                      >
                        Refine
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-10 text-center">
          <h4 className="text-xl font-brand font-black text-zimbabalooba-teal tracking-tight uppercase mb-2">ZIMBABALOOBA</h4>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">Built for the Adventure that is Your Life</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
