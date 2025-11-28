import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Loader2, Sparkles } from 'lucide-react';
import { getChatResponse } from '../services/geminiService';

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: "Systems online. I am the Limetred Protocol Assistant. Ask me about your contract, tokenomics, or Web3 strategy." }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    // Format history for Gemini SDK
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const response = await getChatResponse(history, userMsg);
    
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
            className="fixed bottom-20 right-6 w-80 md:w-96 h-[500px] bg-[#111111] border border-[#39b54a] shadow-[0_0_30px_rgba(57,181,74,0.2)] z-[200] flex flex-col overflow-hidden font-mono"
          >
            {/* Header */}
            <div className="p-3 bg-[#0c0c0c] border-b border-[#1f1f1f] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#39b54a]" />
                <span className="text-white font-bold text-xs uppercase">Protocol Intelligence</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-[#666] hover:text-white">
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[80%] p-3 text-xs leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-[#39b54a]/10 border border-[#39b54a]/30 text-white rounded-tl-lg rounded-bl-lg rounded-br-lg' 
                        : 'bg-[#1f1f1f] text-[#ccc] rounded-tr-lg rounded-bl-lg rounded-br-lg'
                    }`}
                  >
                    {msg.text}
                  </div>
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
            <div className="p-3 bg-[#0c0c0c] border-t border-[#1f1f1f] flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about your dApp..."
                className="flex-1 bg-[#111] border border-[#333] text-white text-xs px-3 py-2 outline-none focus:border-[#39b54a]"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="bg-[#39b54a] text-black p-2 hover:bg-[#2ea03f] disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-[#39b54a] text-black flex items-center justify-center shadow-[0_0_20px_rgba(57,181,74,0.4)] z-[200] hover:bg-[#white] transition-colors group"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} className="group-hover:rotate-12 transition-transform"/>}
      </motion.button>
    </>
  );
};

export default AIAssistant;