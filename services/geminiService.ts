
import { GoogleGenAI } from "@google/genai";
import { MODEL_SHOT_PROMPT } from "../constants";
import { StudioTier } from "../types";

const getBase64Parts = (base64Image: string) => {
  const match = base64Image.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid image format.");
  }
  return { mimeType: match[1], data: match[2] };
};

export const generateModelFit = async (
  base64Image: string,
  config: { 
    modelType: string, 
    modelRace: string,
    pose: string, 
    background: string, 
    aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
    customInstructions?: string
  },
  tier: StudioTier
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const { mimeType, data } = getBase64Parts(base64Image);
  const prompt = MODEL_SHOT_PROMPT(config);
  
  // Model selection based on tier
  const modelName = tier === 'pro' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
  
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          { inlineData: { data, mimeType } },
          { text: prompt },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: config.aspectRatio,
          // Only gemini-3-pro-image-preview supports imageSize
          ...(tier === 'pro' ? { imageSize: "1K" } : {})
        }
      }
    });

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      const imagePart = candidate.content.parts.find(p => p.inlineData);
      if (imagePart?.inlineData?.data) {
        return `data:image/png;base64,${imagePart.inlineData.data}`;
      }
    }
    
    throw new Error("Model finished but returned no image. Check safety filters.");
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes('RESOURCE_EXHAUSTED') || error.message?.includes('429')) {
      throw new Error("QUOTA_EXCEEDED");
    }
    throw new Error(error.message || "Generation failed.");
  }
};

export const editGeneratedImage = async (
  base64Image: string,
  editPrompt: string,
  tier: StudioTier
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const { mimeType, data } = getBase64Parts(base64Image);
  const modelName = tier === 'pro' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';

  const instruction = `
    Edit this photoshoot: "${editPrompt}".
    Preserve model pose and Zimbabalooba fabric textures. High-end quality required.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          { inlineData: { data, mimeType } },
          { text: instruction },
        ],
      },
      config: {
         ...(tier === 'pro' ? { imageConfig: { imageSize: "1K" } } : {})
      }
    });

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      const imagePart = candidate.content.parts.find(p => p.inlineData);
      if (imagePart?.inlineData?.data) {
        return `data:image/png;base64,${imagePart.inlineData.data}`;
      }
    }

    throw new Error("Editing finished but returned no image.");
  } catch (error: any) {
    if (error.message?.includes('RESOURCE_EXHAUSTED') || error.message?.includes('429')) {
      throw new Error("QUOTA_EXCEEDED");
    }
    throw new Error(error.message || "Editing failed.");
  }
};
