
import { GoogleGenAI } from "@google/genai";
import { MODEL_SHOT_PROMPT } from "../constants";

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
  usePersonalKey: boolean = false
): Promise<string> => {
  /**
   * Create a new GoogleGenAI instance right before making an API call to ensure 
   * it always uses the most up-to-date API key from the environment.
   */
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const { mimeType, data } = getBase64Parts(base64Image);
  const prompt = MODEL_SHOT_PROMPT(config);
  
  // Use gemini-3-pro-image-preview for high quality (paid/personal key) or gemini-2.5-flash-image for general tasks.
  const modelName = usePersonalKey ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
  
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
          ...(usePersonalKey ? { imageSize: "1K" } : {})
        }
      }
    });

    // Iterate through parts to find the image data, as instructed for image generation models.
    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      const imagePart = candidate.content.parts.find(p => p.inlineData);
      if (imagePart?.inlineData?.data) {
        return `data:image/png;base64,${imagePart.inlineData.data}`;
      }
    }
    
    throw new Error("Model finished but returned no image. This usually means the content was flagged by safety filters.");
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
  usePersonalKey: boolean = false
): Promise<string> => {
  // Create instance right before call for key reactivity.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const { mimeType, data } = getBase64Parts(base64Image);
  const modelName = usePersonalKey ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';

  const instruction = `
    Please edit the provided photoshoot image based on these instructions: "${editPrompt}".
    Maintain the model's pose and the specific textures and patterns of the Zimbabalooba African cotton pants. 
    Ensure the result is high-end studio quality.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          { inlineData: { data, mimeType } },
          { text: instruction },
        ],
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
