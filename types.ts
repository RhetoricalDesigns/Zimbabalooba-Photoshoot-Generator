
export interface GenerationState {
  isGenerating: boolean;
  isEditing: boolean;
  error: string | null;
  resultUrl: string | null;
}

export type ModelType = 'male' | 'female' | 'unisex';
export type StudioTier = 'free' | 'pro';

export interface FittingConfig {
  modelType: ModelType;
  modelRace: string;
  pose: string;
  background: string;
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
  customInstructions: string;
}
