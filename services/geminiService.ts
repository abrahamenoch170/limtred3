import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedApp } from "../types";
import { PREBUILT_CODE, PREBUILT_REACT } from "../constants";

const getClient = () => {
  try {
    // Robust Safety check: Handle cases where process is undefined (browser) vs defined (Node)
    // This prevents "ReferenceError: process is not defined" crashes on Vercel/Vite
    let apiKey = undefined;
    try {
      // Use a safe access pattern for process.env
      if (typeof process !== 'undefined' && process && process.env) {
        apiKey = process.env.API_KEY;
      }
    } catch (e) {
      // Ignore process access errors in strict browser environments
    }

    if (!apiKey || apiKey.trim() === '') return null;
    return new GoogleGenAI({ apiKey });
  } catch (e) {
    console.warn("Environment variable access failed, falling back to mock mode.");
    return null;
  }
};

// High-fidelity mock data for fallback scenarios
const MOCK_APP_DATA: GeneratedApp = {
  name: "NeoMarket V1 (Beta)",
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
        You are a Senior Solidity Engineer and Web3 Solutions Architect.
        User Request: "${prompt}"

        Your task is to generate a PRODUCTION-READY (Beta Quality) dApp specification.

        1. **Smart Contract (Solidity 0.8.20)**: 
           - Write a COMPLETE, COMPILABLE contract.
           - **CRITICAL REQUIREMENT:** You MUST include these imports at the top:
             \`import "@openzeppelin/contracts/token/ERC20/ERC20.sol";\`
             \`import "@openzeppelin/contracts/access/Ownable.sol";\`
             \`import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";\`
           - **CRITICAL REQUIREMENT:** The contract MUST inherit from ERC20, Ownable, and ReentrancyGuard.
             Example: \`contract MyApp is ERC20, Ownable, ReentrancyGuard { ... }\`
           - The constructor MUST initialize ERC20 with name and symbol, and Ownable with msg.sender.
             Example: \`constructor() ERC20("AppName", "TICKER") Ownable(msg.sender) { ... }\`
           - **CRITICAL REQUIREMENT:** You MUST implement an explicit \`transferOwnership(address newOwner)\` function that overrides Ownable logic to explicitly check \`require(newOwner != address(0), "New owner cannot be zero address");\`.
           - Implement specific logic requested by the user (e.g., Staking, DAO, Lending, Marketplace).
           - If generic, implement a Bonding Curve token with Anti-Rug mechanics.
           - Include detailed comments explaining the logic.
           
        2. **Frontend (React Component)**:
           - Generate a functional React dashboard component.
           - Use 'lucide-react' for icons.
           - Use Tailwind CSS for styling (dark mode, sharp corners).
           
        3. **Metadata**:
           - Name: Creative, viral crypto-native name.
           - Rarity: LEGENDARY (Complex), RARE (Utility), or COMMON (Meme).
           - Market Cap: Integer between 10000 and 1000000.

        Strictly output valid JSON matching the schema.
    `});

    const response = await client.models.generateContent({
      model: 'gemini-3-pro-preview', 
      contents: { parts },
      config: {
        thinkingConfig: { thinkingBudget: 32768 }, 
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