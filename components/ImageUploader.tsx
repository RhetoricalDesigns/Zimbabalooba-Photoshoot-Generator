
import React, { useCallback } from 'react';

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
  selectedImage: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, selectedImage }) => {
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelected(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelected]);

  return (
    <div className="w-full">
      <label className="block text-xs font-bold text-zimbabalooba-teal uppercase tracking-wider mb-2">
        Upload Garment
      </label>
      <div 
        className={`relative group border-2 border-dashed rounded-2xl overflow-hidden transition-all duration-300 h-56 flex flex-col items-center justify-center cursor-pointer
          ${selectedImage ? 'border-transparent shadow-md' : 'border-gray-200 hover:border-zimbabalooba-orange bg-zimbabalooba-lightBg/30 hover:bg-zimbabalooba-lightBg'}
        `}
      >
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleFileChange}
        />
        
        {selectedImage ? (
          <div className="w-full h-full flex items-center justify-center bg-white p-2">
            <img src={selectedImage} alt="Uploaded pants" className="max-h-full object-contain rounded-lg" />
            <div className="absolute inset-0 bg-zimbabalooba-teal/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <span className="bg-white text-zimbabalooba-teal px-4 py-2 rounded-full text-xs font-bold shadow-lg">
                Change Image
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-white text-zimbabalooba-orange rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-sm">
              <i className="fa-solid fa-camera-retro text-xl"></i>
            </div>
            <p className="text-gray-700 font-bold text-xs">Drop your hand-dyed cotton here</p>
            <p className="text-gray-400 text-[10px] mt-1 uppercase tracking-widest font-medium">Capture the Adventure</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
