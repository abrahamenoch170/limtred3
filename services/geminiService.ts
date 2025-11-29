

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
      // We check if 'process' exists as a global first
      if (typeof process !== 'undefined' && process && process.env) {
        apiKey = process.env.API_KEY;
      }
    } catch (e) {
      // Ignore process access errors in strict browser environments
      console.warn("Process env access failed, likely browser environment.", e);
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
             \`import "@openzeppelin/contracts/utils/Pausable.sol";\`
           - **CRITICAL REQUIREMENT:** The contract MUST inherit from ERC20, Ownable, ReentrancyGuard, and Pausable.
             Example: \`contract MyApp is ERC20, Ownable, ReentrancyGuard, Pausable { ... }\`
           - The constructor MUST initialize ERC20 with name and symbol, and Ownable with msg.sender.
           
           **SECURITY & LOGIC REQUIREMENTS (BETA STANDARD):**
           - **Custom Errors:** Use \`error\` definitions instead of string require statements for gas optimization.
             - Replace ALL \`require(condition, "message")\` with \`if (!condition) revert ErrorName();\`.
             - Example errors: \`error InvalidWallet();\`, \`error TransferFailed();\`, \`error InvalidOwner();\`, \`error TradingNotActive();\`.
           - **Anti-Whale:** Implement \`maxTxAmount\` and \`maxWalletSize\` variables (e.g. 2% of supply).
           - **Fees:** Implement \`buyTax\` and \`sellTax\` variables (e.g. 5%) and a \`marketingWallet\`.
           - **Reentrancy Protection:** Apply \`nonReentrant\` modifier to \`withdrawStuckEth\`, \`enableTrading\`, and any other function that moves funds or changes critical state.
           - **Pausable Logic:**
             - Implement \`pause()\` and \`unpause()\` functions callable only by owner.
             - Apply \`whenNotPaused\` to the \`_update\` override and \`enableTrading\`.
           - **_update Override:** You MUST override the \`_update\` function to handle:
             1. Trading Active check (using \`whenNotPaused\`).
             2. Max Tx / Max Wallet limits.
             3. Fee deduction (send tax to marketing wallet, remainder to recipient).
           - **Emergency:** Implement \`withdrawStuckEth()\` to recover funds (protected by \`onlyOwner\` and \`nonReentrant\`).
           - **Vesting:** Implement \`struct VestingSchedule\` (recipient, startDate, cliffDate, endDate, amount, claimed) and mapping.
             - Function \`createVestingSchedule(address _recipient, uint256 _startDate, uint256 _cliffDate, uint256 _endDate, uint256 _amount)\` (onlyOwner) which transfers tokens from owner to contract to lock them.
             - Function \`claimVestedTokens()\` (nonReentrant) for users to claim.
           
           **STANDARD FUNCTIONS:**
           - \`enableTrading()\` (onlyOwner, nonReentrant, whenNotPaused).
           - \`setMarketingWallet(address _marketingWallet)\` (onlyOwner).
           - \`transferOwnership(address newOwner)\` (override with zero-address check using custom error).
           - \`calculatedTotalSupply()\` (public view, returns totalSupply).
           - **Struct Accessors:** If you use structs, provide a \`getDetails\` view function.

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

// --- IMAGE ANALYSIS (For Asset Studio) ---
export const analyzeImage = async (imageBase64: string): Promise<string> => {
  const client = getClient();
  if (!client) return "Mock Analysis: A futuristic 3D icon with glowing green accents suitable for a DeFi protocol. Sharp geometric shapes and high contrast.";

  try {
    const base64Data = imageBase64.split(',')[1] || imageBase64;
    const response = await client.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
            { inlineData: { mimeType: "image/png", data: base64Data } },
            { text: "Analyze this image and provide a concise, descriptive text prompt that could be used to recreate a similar style asset using an AI image generator. Focus on visual style, colors, lighting, subject matter, and composition. Keep it under 50 words." }
        ]
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("Analysis error:", error);
    return "Failed to analyze image.";
  }
};