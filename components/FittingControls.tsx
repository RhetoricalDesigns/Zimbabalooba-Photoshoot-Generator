
import React from 'react';
import { FittingConfig, ModelType } from '../types';
import { POSES, BACKGROUNDS, ASPECT_RATIOS, RACES } from '../constants';

interface FittingControlsProps {
  config: FittingConfig;
  onChange: (config: FittingConfig) => void;
}

const FittingControls: React.FC<FittingControlsProps> = ({ config, onChange }) => {
  const updateConfig = (key: keyof FittingConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Custom Style Notes */}
      <div>
        <label className="block text-xs font-bold text-zimbabalooba-teal uppercase tracking-wider mb-2 flex items-center">
          <i className="fa-solid fa-feather-pointed mr-2"></i>
          Style Instructions
        </label>
        <textarea
          value={config.customInstructions}
          onChange={(e) => updateConfig('customInstructions', e.target.value)}
          placeholder="e.g. Add a yellow bucket hat, or change shoes to leather sandals..."
          className="w-full h-20 p-4 text-xs bg-zimbabalooba-lightBg/20 border-2 border-gray-100 rounded-2xl focus:border-zimbabalooba-orange focus:ring-0 transition-all resize-none font-medium placeholder:text-gray-300"
        />
      </div>

      {/* Pose Selection - Added missing section */}
      <div>
        <label className="block text-xs font-bold text-zimbabalooba-teal uppercase tracking-wider mb-2">Model Pose</label>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
          {POSES.map((pose) => (
            <button
              key={pose.id}
              onClick={() => updateConfig('pose', pose.label)}
              className={`flex items-center p-2 rounded-xl border-2 transition-all text-left
                ${config.pose === pose.label 
                  ? 'border-zimbabalooba-orange bg-zimbabalooba-orange/5' 
                  : 'border-gray-50 bg-white hover:border-gray-200'}
              `}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center mr-2.5 
                ${config.pose === pose.label ? 'bg-zimbabalooba-orange text-white' : 'bg-gray-50 text-gray-400'}`}
              >
                <i className={`fa-solid ${pose.icon} text-[10px]`}></i>
              </div>
              <span className={`text-[10px] font-bold ${config.pose === pose.label ? 'text-zimbabalooba-orange' : 'text-gray-500'}`}>
                {pose.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Model Gender/Type */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Gender</label>
          <div className="grid grid-cols-1 gap-1">
            {(['male', 'female', 'unisex'] as ModelType[]).map((type) => (
              <button
                key={type}
                onClick={() => updateConfig('modelType', type)}
                className={`py-1.5 px-3 rounded-lg text-[10px] font-bold capitalize border-2 transition-all
                  ${config.modelType === type 
                    ? 'border-zimbabalooba-orange bg-zimbabalooba-orange text-white' 
                    : 'border-gray-50 bg-white text-gray-400 hover:border-gray-200'}
                `}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Aspect Ratio */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Ratio</label>
          <div className="grid grid-cols-1 gap-1">
            {ASPECT_RATIOS.slice(0, 3).map((ratio) => (
              <button
                key={ratio.id}
                onClick={() => updateConfig('aspectRatio', ratio.id)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border-2 transition-all
                  ${config.aspectRatio === ratio.id 
                    ? 'border-zimbabalooba-teal bg-zimbabalooba-teal text-white' 
                    : 'border-gray-50 bg-white text-gray-400 hover:border-gray-200'}
                `}
              >
                {ratio.id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Model Ethnicity/Race */}
      <div>
        <label className="block text-xs font-bold text-zimbabalooba-teal uppercase tracking-wider mb-2">Model Ethnicity</label>
        <div className="flex flex-wrap gap-1.5">
          {RACES.map((race) => (
            <button
              key={race.id}
              onClick={() => updateConfig('modelRace', race.label)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border-2 transition-all
                ${config.modelRace === race.label 
                  ? 'border-zimbabalooba-orange bg-white text-zimbabalooba-orange shadow-sm border-zimbabalooba-orange/30' 
                  : 'border-gray-50 bg-white text-gray-400 hover:border-gray-100'}
              `}
            >
              {race.label}
            </button>
          ))}
        </div>
      </div>

      {/* Background Selection */}
      <div>
        <label className="block text-xs font-bold text-zimbabalooba-teal uppercase tracking-wider mb-2">Background</label>
        <div className="grid grid-cols-2 gap-2">
          {BACKGROUNDS.map((bg) => (
            <button
              key={bg.id}
              onClick={() => updateConfig('background', bg.label)}
              className={`flex items-center p-2 rounded-xl border-2 transition-all text-left group
                ${config.background === bg.label 
                  ? 'border-zimbabalooba-teal bg-zimbabalooba-lightBg' 
                  : 'border-gray-50 bg-white hover:border-zimbabalooba-teal/20'}
              `}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center mr-2.5 transition-colors
                ${config.background === bg.label ? 'bg-zimbabalooba-teal text-white' : 'bg-gray-50 text-gray-300'}`}
              >
                <i className={`fa-solid ${bg.icon} text-[10px]`}></i>
              </div>
              <span className={`text-[10px] font-bold ${config.background === bg.label ? 'text-zimbabalooba-teal' : 'text-gray-500'}`}>
                {bg.label}
              </span>
            </button>
          ))}
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default FittingControls;
