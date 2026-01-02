
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
  }
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const { mimeType, data } = getBase64Parts(base64Image);

  const prompt = MODEL_SHOT_PROMPT(config);
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data, mimeType } },
          { text: prompt },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: config.aspectRatio
        }
      }
    });

    const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (imagePart && imagePart.inlineData) {
      return `data:image/png;base64,${imagePart.inlineData.data}`;
    }
    throw new Error("The AI model finished processing but didn't provide an image result.");
  } catch (error: any) {
    if (error.message?.includes("PERMISSION_ISSUE")) throw error;
    throw new Error(error.message || "Generation failed.");
  }
};

export const editGeneratedImage = async (
  base64Image: string,
  editPrompt: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const { mimeType, data } = getBase64Parts(base64Image);

  const instruction = `
    Please edit the provided photoshoot image based on these instructions: "${editPrompt}".
    Maintain the model's pose and the specific textures and patterns of the Zimbabalooba African cotton pants. 
    Ensure the result is high-end studio quality.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data, mimeType } },
          { text: instruction },
        ],
      }
    });

    const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (imagePart && imagePart.inlineData) {
      return `data:image/png;base64,${imagePart.inlineData.data}`;
    }
    throw new Error("The AI model finished processing but didn't provide an image result.");
  } catch (error: any) {
    throw new Error(error.message || "Editing failed.");
  }
};
