import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedApp } from "../types";
import { PREBUILT_CODE, PREBUILT_REACT } from "../constants";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateAppConcept = async (prompt: string): Promise<GeneratedApp> => {
  const client = getClient();
  
  // Fallback to mock if no API key is present
  if (!client) {
    console.warn("No API_KEY found. Using mock generation.");
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate latency
    return {
      name: "NeoMarket V1",
      description: "A decentralized marketplace for trading fractionalized attention spans.",
      codeSnippet: PREBUILT_REACT,
      contractSnippet: PREBUILT_CODE,
      rarity: "LEGENDARY",
      attributes: ["GAS OPTIMIZED", "ANTI-RUG", "AUTO-LP"],
    };
  }

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a web3 app concept based on this prompt: "${prompt}". 
      Return a JSON object with a catchy name, a short description, a React code snippet (simplified UI), 
      a Solidity contract snippet, a rarity level (COMMON, RARE, or LEGENDARY), and a list of 3 cool technical attributes.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            codeSnippet: { type: Type.STRING },
            contractSnippet: { type: Type.STRING },
            rarity: { type: Type.STRING, enum: ["COMMON", "RARE", "LEGENDARY"] },
            attributes: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ["name", "description", "codeSnippet", "contractSnippet", "rarity", "attributes"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GeneratedApp;
    }
    throw new Error("Empty response");
  } catch (error) {
    console.error("Gemini generation failed:", error);
    // Fallback on error
     return {
      name: "ErrorFallback App",
      description: "Could not generate app. Please check API Key.",
      codeSnippet: PREBUILT_REACT,
      contractSnippet: PREBUILT_CODE,
      rarity: "COMMON",
      attributes: ["ERROR HANDLER", "FALLBACK MODE"],
    };
  }
};