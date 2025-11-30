
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedApp } from "../types";
import { PREBUILT_CODE, PREBUILT_REACT } from "../constants";

const getClient = () => {
  try {
    let apiKey = undefined;
    // Safe access to process.env that won't crash in browser
    if (typeof process !== 'undefined' && process && process.env) {
      apiKey = process.env.API_KEY;
    }
    // Fallback for some build tools
    if (!apiKey && typeof import.meta !== 'undefined') {
      const meta = import.meta as any;
      if (meta.env) {
        apiKey = meta.env.VITE_API_KEY || meta.env.REACT_APP_API_KEY;
      }
    }

    if (!apiKey || apiKey.trim() === '') return null;
    return new GoogleGenAI({ apiKey });
  } catch (e) {
    console.warn("Environment variable access failed, falling back to mock mode.", e);
    return null;
  }
};

const MOCK_APP_DATA: GeneratedApp = {
  name: "NeoMarket V1 (Beta)",
  description: "A decentralized marketplace for trading fractionalized attention spans. Users stake attention tokens to boost content visibility.",
  codeSnippet: PREBUILT_REACT,
  contractSnippet: PREBUILT_CODE,
  rarity: "LEGENDARY",
  attributes: ["ATTENTION STAKING", "DYNAMIC YIELD", "ANTI-WHALE"],
  marketCap: 12500
};

export const generateAppConcept = async (prompt: string, imageBase64?: string): Promise<GeneratedApp> => {
  const client = getClient();
  
  if (!client) {
    console.warn("No API_KEY found. Using mock generation.");
    await new Promise(resolve => setTimeout(resolve, 2500));
    return MOCK_APP_DATA;
  }

  try {
    const parts: any[] = [];
    
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
        You are a **Senior Smart Contract Auditor & Architect** at a top-tier security firm (OpenZeppelin/CertiK).
        
        User Request: "${prompt}"

        **MISSION:** 
        Generate a PRODUCTION-READY, MAINNET-SAFE dApp specification. The code must be compile-ready for Remix without errors.

        **1. Smart Contract Strategy (Solidity 0.8.20):**
           - **Standard:** Use OpenZeppelin 5.x contracts.
           - **Security:** Implement 'Custom Errors' (e.g., \`error Unauthorized();\`) instead of require strings for gas efficiency.
           - **Guardrails:** Add \`nonReentrant\` to all external/public functions that handle value.
           - **Management:** Include \`pause()\` and \`unpause()\` for emergency stops.
           - **Imports:** STRICTLY use these imports:
             \`import "@openzeppelin/contracts/token/ERC20/ERC20.sol";\`
             \`import "@openzeppelin/contracts/access/Ownable.sol";\`
             \`import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";\`
             \`import "@openzeppelin/contracts/utils/Pausable.sol";\`

        **2. Frontend Strategy (React + Tailwind):**
           - Generate a sleek, dark-mode 'Cyberpunk' dashboard.
           - Use 'lucide-react' for icons.
           - Include a 'Connect Wallet' button placeholder.
           - Ensure responsive layout (mobile-first).

        **3. Metadata:**
           - Name, Description, Rarity, and 3-5 key Attributes (e.g., "Audited", "Liquidity Locked").

        **OUTPUT FORMAT:**
        Return ONLY valid JSON matching this schema:
        {
          "name": "string",
          "description": "string",
          "codeSnippet": "string (React Code)",
          "contractSnippet": "string (Solidity Code)",
          "rarity": "COMMON" | "RARE" | "LEGENDARY",
          "attributes": ["string"],
          "marketCap": number
        }
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
      // Ensure we only parse the JSON object part
      const firstBrace = cleanedText.indexOf('{');
      const lastBrace = cleanedText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
          cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
      }
      return JSON.parse(cleanedText) as GeneratedApp;
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Gemini generation failed:", error);
    return MOCK_APP_DATA;
  }
};

export const generateTokenApp = async (name: string, symbol: string, supply: string, decimals: string): Promise<GeneratedApp> => {
  // Re-use the main generator but with a specific token prompt
  const prompt = `Create a robust ERC20 Token named '${name}' (${symbol}) with a supply of ${supply}. 
  Features: 
  1. Anti-Whale (Max Transaction Limit 2%).
  2. Buy/Sell Tax (Marketing Wallet).
  3. Auto-Liquidity mechanism.
  4. Ensure code compiles with Solidity 0.8.20 and uses OpenZeppelin.`;
  
  return generateAppConcept(prompt);
};

export const getChatResponse = async (history: {role: string, parts: {text: string}[]}[], message: string) => {
  const client = getClient();
  if (!client) return "I am running in demo mode. Please configure an API Key to chat.";

  try {
    const chat = client.chats.create({
      model: 'gemini-3-pro-preview',
      history: history,
      config: {
        systemInstruction: "You are the Limetred Protocol Guardian, a specialized AI for Web3 Security. Your primary goal is to prevent users from falling for scams, rug pulls, or honey-pots. When a user asks about a swap or transaction, analyze it for risk. If they mention sending money, ALWAYS advise checking the address. If they ask about swapping tokens, mention concepts like slippage, liquidity verification, and contract audits. Be concise, professional, and protective."
      }
    });

    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Chat error:", error);
    return "Connection to Protocol Neural Net failed (Check API Key Permissions).";
  }
};

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
          aspectRatio: aspectRatio as any, 
          imageSize: "1K"
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64 = part.inlineData.data;
                const mimeType = part.inlineData.mimeType || "image/png";
                return `data:${mimeType};base64,${base64}`;
            }
        }
    }
    return null;
  } catch (error) {
    console.error("Image gen error:", error);
    return null;
  }
};

export const analyzeImage = async (imageBase64: string): Promise<string> => {
  const client = getClient();
  if (!client) return "Mock Analysis: A futuristic 3D icon with glowing green accents suitable for a DeFi protocol.";

  try {
    const base64Data = imageBase64.split(',')[1] || imageBase64;
    const response = await client.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
            { inlineData: { mimeType: "image/png", data: base64Data } },
            { text: "Analyze this image and provide a concise, descriptive text prompt for an AI image generator. Keep it under 50 words." }
        ]
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("Analysis error:", error);
    return "Failed to analyze image.";
  }
};
