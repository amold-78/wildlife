import React, { useState, useRef, useEffect } from 'react';
import { RANGER_SUGGESTIONS, getRangerReply } from '../../data/rangerKnowledge';
import { X, Send, Compass } from 'lucide-react';

export default function AskRangerModal({ onSelectSafari: _onSelectSafari, onNavigate: _onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ranger',
      title: 'Namaste! I am Ranger Devraj.',
      text: 'I am your WildTrail expedition naturalist. Ask me anything about seasonal tiger sightings, gate permits, family recommendations, or park comparisons!'
    }
  ]);
  const [inputText, setInputText] = useState('');
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

    const newMsgList = [...messages, { sender: 'user', text: query }];
    setMessages(newMsgList);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const reply = getRangerReply(query);
      setMessages([...newMsgList, { sender: 'ranger', ...reply }]);
      setIsTyping(false);
    }, 420);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-4 right-3 sm:bottom-6 sm:right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Open Ask Ranger Naturalist Assistant"
          className="group flex items-center gap-2.5 px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-[#0B201A] text-[#F3EDE0] shadow-[0_14px_34px_-8px_rgba(3,12,9,0.75)] hover:bg-[#113127] border border-[#C99A4A]/55 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C99A4A]"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#133329] border border-[#C99A4A]/60 text-[#E4B865] flex items-center justify-center shrink-0">
            <Compass className="w-4 h-4 text-[#E4B865]" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold tracking-wider uppercase text-[#E4B865] leading-tight">
              Ask Ranger
            </p>
            <p className="hidden sm:block text-[11px] text-[#B8CEC4] leading-tight mt-0.5">
              Naturalist Field Desk
            </p>
          </div>
        </button>
      </div>

      {/* Slide-over Chat Box */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-[410px] max-h-[80vh] h-[560px] flex flex-col rounded-2xl bg-[#FBF8F3] dark:bg-[#0B221B] border border-[#C99A4A]/50 shadow-[0_28px_68px_-16px_rgba(3,12,9,0.85)] overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-[#09211A] p-4 text-[#F4EBDA] flex items-center justify-between border-b border-[#265244]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#113127] border border-[#C99A4A]/55 flex items-center justify-center text-[#E4B865] shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-base text-[#F8F3E8]">
                    Ranger Devraj
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-[#153D30] text-[#86EFAC] border border-[#265244] rounded-md">
                    Field Naturalist
                  </span>
                </div>
                <p className="text-xs text-[#B8CEC4]">WildTrail Expedition Desk</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close Ranger chat"
              className="p-1.5 rounded-lg text-[#9AB3A8] hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Conversation Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F5EFE6] dark:bg-[#071713]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ranger' && (
                  <div className="w-7 h-7 rounded-lg bg-[#0D2922] border border-[#C99A4A]/50 text-[#E4B865] flex items-center justify-center shrink-0 mt-0.5">
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#0D2922] text-[#F8F3E8] border border-[#265244] rounded-br-none'
                      : 'bg-[#FBF8F3] dark:bg-[#0C211B] text-[#14261F] dark:text-[#F0ECE1] border border-[#D8CEBE] dark:border-[#244E40] rounded-bl-none'
                  }`}
                >
                  {msg.title && (
                    <p className="font-semibold text-xs text-[#B88428] dark:text-[#E4B865] mb-1">
                      {msg.title}
                    </p>
                  )}
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-[#C99A4A] text-[#0D2922] flex items-center justify-center shrink-0 text-[11px] font-bold mt-0.5">
                    You
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-[#43564E] dark:text-[#9AB3A8] text-xs pl-2">
                <span className="text-xs font-medium">Ranger checking field logs...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Preset Suggestions */}
          <div className="p-2.5 bg-[#FBF8F3] dark:bg-[#0B221B] border-t border-[#D8CEBE] dark:border-[#244E40] overflow-x-auto whitespace-nowrap flex gap-2">
            {RANGER_SUGGESTIONS.slice(0, 3).map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(sug)}
                className="px-3 py-1.5 text-xs bg-[#EFE6D7] dark:bg-[#113127] hover:bg-[#E5D9C5] dark:hover:bg-[#173F35] border border-[#D8CEBE] dark:border-[#265244] rounded-lg text-[#14261F] dark:text-[#E9DFC9] transition text-left flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Compass className="w-3 h-3 text-[#C99A4A] shrink-0" />
                <span className="truncate max-w-[200px]">{sug}</span>
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-[#FBF8F3] dark:bg-[#0B221B] border-t border-[#D8CEBE] dark:border-[#244E40] flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about tigers, gate permits, seasons..."
              className="flex-1 bg-white dark:bg-[#071713] border border-[#D8CEBE] dark:border-[#265244] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#14261F] dark:text-[#F0ECE1] placeholder-[#64776E] focus:outline-none focus:border-[#C99A4A]"
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!inputText.trim() || isTyping}
              aria-label="Send message to Ranger"
              className="p-2.5 bg-[#C99A4A] hover:bg-[#D8AA5B] disabled:opacity-40 text-[#0D2922] rounded-xl transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
