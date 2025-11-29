
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Loader2, Sparkles, ShieldAlert, Lock, CheckCircle, ArrowRight, AlertTriangle } from 'lucide-react';
import { getChatResponse } from '../services/geminiService';

interface AIAssistantProps {
    isOpen?: boolean;
    onToggle?: () => void;
    initialMessage?: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen: externalIsOpen, onToggle, initialMessage }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string, type?: 'TX_REQUEST', txDetails?: any}[]>([
    { role: 'model', text: "Systems online. I am the Limetred Protocol Guardian, a specialized AI for Web3 Security. Your primary goal is to prevent users from falling for scams, rug pulls, or honey-pots. When a user asks about a swap or transaction, analyze it for risk. If they mention sending money, ALWAYS advise checking the address. If they ask about swapping tokens, mention concepts like slippage, liquidity verification, and contract audits. Be concise, professional, and protective." }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const toggleOpen = onToggle || (() => setInternalIsOpen(!internalIsOpen));
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const processedInitialMessageRef = useRef<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Reset processed message ref when closed so it can re-trigger on re-open
  useEffect(() => {
      if (!isOpen) {
          processedInitialMessageRef.current = null;
      }
  }, [isOpen]);

  // Handle incoming context message
  useEffect(() => {
    if (isOpen && initialMessage && initialMessage !== processedInitialMessageRef.current) {
        processedInitialMessageRef.current = initialMessage;
        handleSend(initialMessage);
    }
  }, [isOpen, initialMessage]);

  const parseTransactionIntent = (text: string) => {
      // Regex to find: "Send [Amount] [Token] to [Address]"
      const regex = /(?:send|transfer)\s+(\d+(?:\.\d+)?)\s*(\w+)\s+(?:to\s+)?(0x[a-fA-F0-9]{40})/i;
      const match = text.match(regex);
      if (match) {
          return {
              amount: match[1],
              token: match[2].toUpperCase(),
              address: match[3]
          };
      }
      return null;
  };

  const handleSend = async (messageOverride?: string) => {
    const textToSend = messageOverride || input;
    if (!textToSend.trim()) return;
    
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setIsTyping(true);

    // 1. Check for Transaction Intent
    const txIntent = parseTransactionIntent(textToSend);
    
    if (txIntent) {
        // Simulate Security Scan delay
        setTimeout(() => {
            const isScam = txIntent.address.toLowerCase().startsWith('0x0000'); // Mock scam detector logic
            
            const responseMsg = {
                role: 'model' as const,
                text: isScam 
                    ? `⚠️ SECURITY ALERT: The address ${txIntent.address.slice(0,6)}... has been flagged in my database as a potential honey-pot. I have blocked this transaction.`
                    : `I have analyzed the destination address. It appears clean with no prior phishing reports. Please confirm the details below to execute.`,
                type: 'TX_REQUEST' as const,
                txDetails: { ...txIntent, risk: isScam ? 'HIGH' : 'LOW' }
            };
            
            setIsTyping(false);
            setMessages(prev => [...prev, responseMsg]);
        }, 1500);
        return;
    }

    // 2. Standard Chat
    // Format history for Gemini SDK
    const history = messages.filter(m => !m.type).map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const response = await getChatResponse(history, textToSend);
    
    setIsTyping(false);
    if (response) {
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-0 right-0 w-full h-[60vh] md:bottom-20 md:right-6 md:w-96 md:h-[500px] bg-[#111111] border-t md:border border-[#39b54a] shadow-[0_-10px_40px_rgba(57,181,74,0.1)] z-[200] flex flex-col overflow-hidden font-mono rounded-t-xl md:rounded-xl"
          >
            {/* Header */}
            <div className="p-4 border-b bg-[#0c0c0c] border-[#1f1f1f] flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#39b54a] animate-pulse"></div>
                <Sparkles size={16} className="text-[#39b54a]" />
                <span className="text-white font-bold text-xs uppercase tracking-wider">Protocol Guardian</span>
              </div>
              <button onClick={toggleOpen} className="text-[#666] hover:text-white p-1">
                <X size={20} />
              </button>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div 
                    className={`max-w-[85%] p-3 text-xs leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-[#333] text-white rounded-tl-lg rounded-bl-lg rounded-br-lg' 
                        : 'bg-[#1f1f1f] text-[#ccc] rounded-tr-lg rounded-bl-lg rounded-br-lg border border-[#333]'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Transaction Card */}
                  {msg.type === 'TX_REQUEST' && msg.txDetails && (
                      <div className={`mt-2 w-[85%] bg-[#0c0c0c] border ${msg.txDetails.risk === 'HIGH' ? 'border-red-500' : 'border-[#39b54a]'} p-3 rounded`}>
                          <div className="flex items-center justify-between mb-2 border-b border-[#333] pb-2">
                              <span className="text-white font-bold text-xs uppercase">Confirm Send</span>
                              {msg.txDetails.risk === 'HIGH' ? <ShieldAlert size={14} className="text-red-500"/> : <CheckCircle size={14} className="text-[#39b54a]"/>}
                          </div>
                          <div className="space-y-1 mb-3">
                              <div className="flex justify-between text-[10px] text-[#888]">
                                  <span>Amount</span>
                                  <span className="text-white font-bold font-mono">{msg.txDetails.amount} {msg.txDetails.token}</span>
                              </div>
                              <div className="flex justify-between text-[10px] text-[#888]">
                                  <span>To</span>
                                  <span className="text-white font-mono">{msg.txDetails.address.slice(0,6)}...{msg.txDetails.address.slice(-4)}</span>
                              </div>
                              <div className="flex justify-between text-[10px] text-[#888]">
                                  <span>Risk Scan</span>
                                  <span className={msg.txDetails.risk === 'HIGH' ? 'text-red-500 font-bold' : 'text-[#39b54a]'}>{msg.txDetails.risk}</span>
                              </div>
                          </div>
                          {msg.txDetails.risk === 'LOW' ? (
                              <button className="w-full bg-[#39b54a] text-black font-bold uppercase py-2 text-xs hover:bg-[#2ea03f] flex items-center justify-center gap-2">
                                  Sign & Send <ArrowRight size={12}/>
                              </button>
                          ) : (
                              <div className="bg-red-900/20 text-red-500 text-[10px] p-2 text-center font-bold border border-red-500/30">
                                  TRANSACTION BLOCKED BY PROTOCOL
                              </div>
                          )}
                      </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#1f1f1f] p-3 rounded-lg flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[#666] rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-[#666] rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-[#666] rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-[#0c0c0c] border-t border-[#1f1f1f] flex gap-2 shrink-0 pb-6 md:pb-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask Guardian..."
                className="flex-1 bg-[#111] border border-[#333] text-white text-xs px-3 py-2 outline-none focus:border-[#39b54a] transition-colors rounded-none"
              />
              <button 
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="bg-[#39b54a] text-black p-2 hover:bg-[#2ea03f] disabled:opacity-50 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleOpen}
        className="fixed bottom-6 right-6 w-12 h-12 bg-[#39b54a] text-black flex items-center justify-center shadow-[0_0_20px_rgba(57,181,74,0.4)] z-[190] hover:bg-white transition-colors group rounded-full md:rounded-none"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} className="group-hover:rotate-12 transition-transform"/>}
      </motion.button>
    </>
  );
};

export default AIAssistant;
