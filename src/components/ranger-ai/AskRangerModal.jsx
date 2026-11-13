import React, { useState, useRef, useEffect } from 'react';
import { RANGER_SUGGESTIONS, getRangerReply } from '../../data/rangerKnowledge';
import { MessageSquare, X, Send, Sparkles, Bot, User, Compass, HelpCircle } from 'lucide-react';

export default function AskRangerModal({ onSelectSafari, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "ranger",
      title: "Namaste! I am Ranger Devraj.",
      text: "I am your WildTrail expedition naturalist. Ask me anything about seasonal tiger sightings, gate permits, family recommendations, or park comparisons!"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    // Add user message
    const newMsgList = [...messages, { sender: "user", text: query }];
    setMessages(newMsgList);
    setInputText("");
    setIsTyping(true);

    // Simulate smart naturalist response after 400ms
    setTimeout(() => {
      const reply = getRangerReply(query);
      setMessages([...newMsgList, { sender: "ranger", ...reply }]);
      setIsTyping(false);
    }, 450);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#0D2922] text-[#F7F5EF] shadow-2xl hover:bg-[#173F35] border border-[#C99A4A]/50 transition-all hover:scale-105 active:scale-95"
        >
          <div className="w-7 h-7 rounded-full bg-[#C99A4A] text-white flex items-center justify-center font-bold text-sm shadow">
            🦜
          </div>
          <div className="text-left">
            <p className="text-xs font-bold tracking-wide uppercase text-[#C99A4A]">Ask Ranger</p>
            <p className="text-[11px] text-stone-300">Naturalist AI Assistant</p>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping ml-1" />
        </button>
      </div>

      {/* Slide-over Chat Box */}
      {isOpen && (
        <div className="fixed bottom-20 left-4 sm:left-6 z-50 w-[92vw] sm:w-[420px] max-h-[82vh] h-[600px] flex flex-col rounded-3xl bg-white border border-[#E9DFC9] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Header */}
          <div className="bg-[#0D2922] p-4 text-white flex items-center justify-between border-b border-[#173F35]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#C99A4A] flex items-center justify-center text-xl shadow">
                🦜
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-base text-white">Ranger AI Assistant</h3>
                  <span className="px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider bg-emerald-700/60 text-emerald-200 rounded-full">
                    Active Naturalist
                  </span>
                </div>
                <p className="text-xs text-[#E9DFC9]/80">WildTrail Expedition Desk</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Conversation Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8F7F2]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ranger' && (
                  <div className="w-8 h-8 rounded-full bg-[#173F35] text-white flex items-center justify-center flex-shrink-0 text-sm">
                    🦜
                  </div>
                )}
                
                <div
                  className={`max-w-[82%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#0D2922] text-[#F7F5EF] rounded-br-none'
                      : 'bg-white text-stone-800 border border-[#E9DFC9] rounded-bl-none'
                  }`}
                >
                  {msg.title && (
                    <p className="font-semibold text-xs text-[#C99A4A] mb-1">
                      {msg.title}
                    </p>
                  )}
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-[#C99A4A] text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    You
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-stone-500 text-xs pl-2">
                <span className="w-2 h-2 rounded-full bg-[#173F35] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#173F35] animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-[#173F35] animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] font-medium text-stone-600">Ranger checking field logs...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Preset Suggestions */}
          <div className="p-3 bg-white border-t border-[#E9DFC9] overflow-x-auto whitespace-nowrap flex gap-2 no-scrollbar">
            {RANGER_SUGGESTIONS.slice(0, 3).map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(sug)}
                className="px-3 py-1.5 text-xs bg-[#F8F7F2] hover:bg-[#E9DFC9]/50 border border-[#E9DFC9] rounded-full text-stone-700 hover:text-[#0D2922] transition text-left flex items-center gap-1.5 flex-shrink-0"
              >
                <Sparkles className="w-3 h-3 text-[#C99A4A]" />
                <span className="truncate max-w-[200px]">{sug}</span>
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-[#E9DFC9] flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about tigers, dates, parents..."
              className="flex-1 bg-[#F8F7F2] border border-[#E9DFC9] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#173F35]"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputText.trim() || isTyping}
              className="p-2.5 bg-[#0D2922] hover:bg-[#173F35] disabled:opacity-40 text-white rounded-xl transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}
    </>
  );
}
