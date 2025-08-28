
import { GoogleGenAI, Type } from "@google/genai";
import type { ResistorAnalysisResult } from '../types';

const resistorAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    resistance: {
      type: Type.STRING,
      description: 'The final calculated resistance value, including units (e.g., "4.7 kΩ", "1 MΩ"). Empty if not identified.',
    },
    tolerance: {
      type: Type.STRING,
      description: 'The tolerance of the resistor, including the percent sign (e.g., "±5%", "±10%"). Empty if not identified.',
    },
    bands: {
      type: Type.ARRAY,
      description: 'An array of objects, one for each identified color band, in order from left to right.',
      items: {
        type: Type.OBJECT,
        properties: {
          color: { type: Type.STRING, description: 'The name of the color identified (e.g., "Brown", "Red").' },
          meaning: { type: Type.STRING, description: 'The meaning of this band in its position (e.g., "1st Digit: 1", "Multiplier: x100", "Tolerance: ±2%").' }
        },
        required: ['color', 'meaning']
      }
    },
    explanation: {
      type: Type.STRING,
      description: 'A brief, step-by-step explanation of how the resistance value was calculated. Empty if not identified.'
    },
    error: {
        type: Type.STRING,
        description: 'An error message if a resistor or its bands could not be identified clearly. Should be an empty string on success.'
    }
  },
  required: ['resistance', 'tolerance', 'bands', 'explanation', 'error']
};

const PROMPT = `You are an expert electronics engineer. Analyze the provided image of a resistor. Identify the color bands in their correct order, from left to right. Based on the standard 4-band or 5-band resistor color code, determine the significant digits, the multiplier, and the tolerance. Calculate the final resistance value and express it with appropriate units (e.g., Ω, kΩ, MΩ). Also, state the tolerance percentage. Provide a step-by-step explanation of your calculation. If you cannot clearly identify the bands or if the component is not a resistor, please state that in the 'error' field. Respond ONLY with a JSON object that matches the provided schema.`;


export const analyzeResistorImage = async (base64Image: string, mimeType: string): Promise<ResistorAnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType,
    },
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [imagePart, { text: PROMPT }]
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: resistorAnalysisSchema,
    },
  });

  try {
    const jsonString = response.text;
    const result = JSON.parse(jsonString);
    return result as ResistorAnalysisResult;
  } catch (e) {
    console.error("Failed to parse Gemini response:", e);
    throw new Error("Could not understand the response from the AI. The image may be unclear.");
  }
};
