import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedApp } from "../types";
import { PREBUILT_CODE, PREBUILT_REACT } from "../constants";

const getClient = () => {
  // Safety check: process might be undefined in some browser environments
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : undefined;
  if (!apiKey || apiKey.trim() === '') return null;
  return new GoogleGenAI({ apiKey });
};

// High-fidelity mock data for fallback scenarios (missing key or API error)
const MOCK_APP_DATA: GeneratedApp = {
  name: "NeoMarket V1",
  description: "A decentralized marketplace for trading fractionalized attention spans. Users stake attention tokens to boost content visibility.",
  codeSnippet: PREBUILT_REACT,
  contractSnippet: PREBUILT_CODE,
  rarity: "LEGENDARY",
  attributes: ["ATTENTION STAKING", "DYNAMIC YIELD", "ANTI-WHALE"],
  marketCap: 12500
};

// --- CORE APP GENERATION (Thinking + Image Analysis) ---
export const generateAppConcept = async (prompt: string, imageBase64?: string): Promise<GeneratedApp> => {
  const client = getClient();
  
  if (!client) {
    console.warn("No API_KEY found. Using mock generation.");
    await new Promise(resolve => setTimeout(resolve, 2500));
    return MOCK_APP_DATA;
  }

  try {
    const parts: any[] = [];
    
    // Add image part if provided (Image Analysis)
    if (imageBase64) {
      // Strip header if present (e.g. data:image/png;base64,)
      const base64Data = imageBase64.split(',')[1] || imageBase64;
      parts.push({
        inlineData: {
          mimeType: "image/png", 
          data: base64Data
        }
      });
      parts.push({ text: "Analyze this image and generate a Web3 dApp specification based on its design or logic. " });
    }

    parts.push({ text: `
        You are a legendary Web3 Solutions Architect.
        User Prompt: "${prompt}"

        Generate a complete dApp specification in JSON format.
        1. Name: A short, viral, crypto-native name.
        2. Description: A compelling 2-sentence pitch.
        3. Rarity: "COMMON", "RARE", or "LEGENDARY".
        4. Attributes: 3 short, technical tags.
        5. Contract Snippet: Solidity (v0.8.20) Logic. Under 40 lines.
        6. Code Snippet: React (Tailwind) Dashboard UI.
        7. Market Cap: A realistic starting market cap number (integer) between 1000 and 50000.

        Strictly output valid JSON.
    `});

    const response = await client.models.generateContent({
      model: 'gemini-3-pro-preview', // Use Pro for complex reasoning
      contents: { parts },
      config: {
        thinkingConfig: { thinkingBudget: 32768 }, // High thinking budget for complex architecture
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
            },
            marketCap: { type: Type.INTEGER }
          },
          required: ["name", "description", "codeSnippet", "contractSnippet", "rarity", "attributes", "marketCap"]
        }
      }
    });

    if (response.text) {
      let cleanedText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const firstBrace = cleanedText.indexOf('{');
      const lastBrace = cleanedText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
          cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
      }
      return JSON.parse(cleanedText) as GeneratedApp;
    }
    throw new Error("Empty response");
  } catch (error) {
    console.error("Gemini generation failed:", error);
    // Fallback to high-quality mock data on ANY error (including 403 Permission Denied)
    // This ensures the app remains usable for demo purposes even with invalid keys.
    return MOCK_APP_DATA;
  }
};

// --- CHATBOT (AI Assistant) ---
export const getChatResponse = async (history: {role: string, parts: {text: string}[]}[], message: string) => {
  const client = getClient();
  if (!client) return "I am running in demo mode. Please configure an API Key to chat.";

  try {
    const chat = client.chats.create({
      model: 'gemini-3-pro-preview',
      history: history,
      config: {
        systemInstruction: "You are the Limetred Protocol AI Assistant. You help users understand Web3, Solidity, and the apps they are generating. Be concise, technical, and helpful."
      }
    });

    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Chat error:", error);
    return "Connection to Protocol Neural Net failed (Check API Key Permissions).";
  }
};

// --- IMAGE GENERATION (Asset Studio) ---
export const generateProjectAsset = async (prompt: string, aspectRatio: string = "1:1") => {
  const client = getClient();
  if (!client) return null;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any, // 1:1, 16:9, etc.
          imageSize: "1K"
        }
      }
    });

    // Check for image in response
    if (response.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
        const base64 = response.candidates[0].content.parts[0].inlineData.data;
        const mimeType = response.candidates[0].content.parts[0].inlineData.mimeType || "image/png";
        return `data:${mimeType};base64,${base64}`;
    }
    return null;
  } catch (error) {
    console.error("Image gen error:", error);
    return null;
  }
};