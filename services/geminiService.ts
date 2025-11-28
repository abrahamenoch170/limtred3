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
    await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate "Thinking" time
    return {
      name: "NeoMarket V1",
      description: "A decentralized marketplace for trading fractionalized attention spans. Users stake attention tokens to boost content visibility.",
      codeSnippet: `export default function NeoMarketDashboard() {
  return (
    <div className="h-full bg-slate-900 text-white p-6 font-mono">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-cyan-400">NEO_MARKET</h1>
        <div className="bg-cyan-900/30 text-cyan-400 px-3 py-1 rounded text-xs">V1.0.2</div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800 p-4 border border-slate-700">
          <div className="text-slate-400 text-xs mb-1">ATTENTION POOL</div>
          <div className="text-2xl font-bold">14,023</div>
        </div>
        <div className="bg-slate-800 p-4 border border-slate-700">
          <div className="text-slate-400 text-xs mb-1">STAKING APY</div>
          <div className="text-2xl font-bold text-green-400">142%</div>
        </div>
      </div>

      <div className="space-y-3">
        {[1,2,3].map(i => (
          <div key={i} className="flex justify-between items-center bg-slate-800 p-3 border border-slate-700 hover:border-cyan-500 transition-colors cursor-pointer">
             <div>
                <div className="font-bold">Fragment #{3420 + i}</div>
                <div className="text-xs text-slate-500">Owner: 0x8a...42b</div>
             </div>
             <button className="bg-cyan-500 text-black text-xs px-3 py-1 font-bold hover:bg-cyan-400">BID</button>
          </div>
        ))}
      </div>
    </div>
  );
}`,
      contractSnippet: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NeoMarketToken is ERC20, Ownable {
    mapping(address => uint256) public attentionStakes;
    uint256 public constant MIN_STAKE = 1000 * 10**18;
    
    event StakeFrozen(address indexed user, uint256 amount);

    constructor() ERC20("NeoMarket", "NEO") {
        _mint(msg.sender, 1_000_000_000 * 10**18);
    }

    // Custom Staking Logic for Attention Economy
    function stakeAttention(uint256 amount) external {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        require(amount >= MIN_STAKE, "Below min stake");
        
        _transfer(msg.sender, address(this), amount);
        attentionStakes[msg.sender] += amount;
        
        emit StakeFrozen(msg.sender, amount);
    }
    
    function calculateYield(address user) public view returns (uint256) {
        return attentionStakes[user] * 5 / 100; // 5% Yield Logic
    }
}`,
      rarity: "LEGENDARY",
      attributes: ["ATTENTION STAKING", "DYNAMIC YIELD", "ANTI-WHALE"],
      marketCap: 12500
    };
  }

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `
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
      `,
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
            },
            marketCap: { type: Type.INTEGER }
          },
          required: ["name", "description", "codeSnippet", "contractSnippet", "rarity", "attributes", "marketCap"]
        }
      }
    });

    if (response.text) {
      try {
        // Robust cleanup: remove any markdown blocks or backticks
        let cleanedText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        // Sometimes the model might output text before the JSON, try to find the first {
        const firstBrace = cleanedText.indexOf('{');
        const lastBrace = cleanedText.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1) {
            cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
        }

        return JSON.parse(cleanedText) as GeneratedApp;
      } catch (jsonError) {
        console.error("JSON Parse Error:", jsonError);
        console.log("Raw Text:", response.text);
        throw new Error("Failed to parse generation result");
      }
    }
    throw new Error("Empty response");
  } catch (error) {
    console.error("Gemini generation failed:", error);
     return {
      name: "ErrorFallback App",
      description: "Could not generate app. Please check API Key.",
      codeSnippet: PREBUILT_REACT,
      contractSnippet: PREBUILT_CODE,
      rarity: "COMMON",
      attributes: ["ERROR HANDLER", "FALLBACK MODE"],
      marketCap: 5000
    };
  }
};