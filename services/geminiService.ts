
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiCategorization } from "../types";

const API_KEY = process.env.API_KEY || '';

export const getGeminiCategorization = async (text: string): Promise<GeminiCategorization> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Parse the following shopping request into a structured JSON list of items. 
    Categorize each item logically (e.g., Produce, Dairy, Meat, Pantry, Bakery, Household, Other).
    Request: "${text}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                category: { type: Type.STRING },
                quantity: { type: Type.STRING }
              },
              required: ["name", "category"]
            }
          }
        },
        required: ["items"]
      }
    }
  });

  return JSON.parse(response.text) as GeminiCategorization;
};
