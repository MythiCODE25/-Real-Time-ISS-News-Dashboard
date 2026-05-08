import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Trash2, Bot, User, Loader2 } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useISS } from '../context/ISSContext';
import { useNews } from '../context/NewsContext';
import { useTheme } from '../context/ThemeContext';

export default function Chatbot() {
  const { messages, isTyping, isOpen, setIsOpen, sendMessage, clearChat } = useChat();
  const { issData, astronauts } = useISS();
  const { articles } = useNews();
  const { isDark } = useTheme();
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    sendMessage(input.trim(), { issData, astronauts, articles });
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    'Where is the ISS right now?',
    'How fast is the ISS moving?',
    'Who is on the ISS?',
    'What are the top news stories?',
  ];

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setIsOpen(o => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          boxShadow: '0 8px 32px rgba(99,102,241,0.5)',
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={22} className="text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Bot size={22} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        {/* Notification badge */}
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{ background: '#ec4899', fontSize: 9 }}>
          AI
        </span>
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-24 right-6 z-[9999] w-[360px] sm:w-[400px] rounded-2xl flex flex-col overflow-hidden shadow-2xl"
            style={{
              height: 520,
              background: isDark ? 'rgba(4,17,40,0.97)' : 'rgba(248,250,252,0.97)',
              border: '1px solid rgba(99,102,241,0.25)',
              backdropFilter: 'blur(30px)',
              boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)',
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b"
              style={{ borderColor: 'rgba(99,102,241,0.15)', background: 'rgba(99,102,241,0.06)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>ARIA</p>
                <div className="flex items-center gap-1.5">
                  <div className="live-dot w-1.5 h-1.5" />
                  <span className="text-xs" style={{ color: '#34d399' }}>Online • Dashboard-aware AI</span>
                </div>
              </div>
              <button onClick={clearChat}
                className="ml-auto p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                style={{ color: '#ef4444' }} title="Clear chat">
                <Trash2 size={15} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <div className="chat-bubble-bot text-sm" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: '12px 16px' }}>
                    <p className="font-medium mb-1" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>👋 Hi! I'm ARIA</p>
                    <p className="text-xs" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                      I can answer questions about ISS location, speed, astronauts, and current news from this dashboard.
                    </p>
                  </div>
                  <p className="text-xs font-medium px-1" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>Quick questions:</p>
                  <div className="space-y-2">
                    {suggestions.map((s) => (
                      <button key={s}
                        onClick={() => {
                          sendMessage(s, { issData, astronauts, articles });
                        }}
                        className="w-full text-left text-xs px-3 py-2.5 rounded-xl border transition-all hover:scale-[1.01]"
                        style={{
                          background: 'rgba(99,102,241,0.06)',
                          borderColor: 'rgba(99,102,241,0.2)',
                          color: isDark ? '#94a3b8' : '#64748b',
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs mt-1"
                    style={{ background: msg.role === 'user' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                    {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                  </div>
                  <div style={{ maxWidth: '75%' }}>
                    <div className={msg.role === 'user' ? 'chat-bubble-user' : ''}
                      style={msg.role === 'bot' ? {
                        background: 'rgba(99,102,241,0.08)',
                        border: '1px solid rgba(99,102,241,0.2)',
                        borderRadius: '4px 12px 12px 12px',
                        padding: '10px 14px',
                        color: isDark ? '#f1f5f9' : '#0f172a',
                        fontSize: 13,
                        lineHeight: 1.6,
                      } : { fontSize: 13, lineHeight: 1.6 }}>
                      {msg.content}
                    </div>
                    <p className="text-xs mt-1 px-1" style={{ color: '#475569' }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                    <Bot size={12} className="text-white" />
                  </div>
                  <div className="flex items-center gap-1.5 px-4 py-3 rounded-xl"
                    style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t" style={{ borderColor: 'rgba(99,102,241,0.15)' }}>
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about ISS or news..."
                  rows={1}
                  className="flex-1 resize-none rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    color: isDark ? '#f1f5f9' : '#0f172a',
                    '::placeholder': { color: '#64748b' },
                    maxHeight: 100,
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={isTyping || !input.trim()}
                  className="p-2.5 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                  {isTyping ? <Loader2 size={16} className="text-white animate-spin" /> : <Send size={16} className="text-white" />}
                </button>
              </div>
              <p className="text-xs text-center mt-2" style={{ color: '#334155' }}>
                ⚡ ARIA uses only dashboard data — no hallucinations
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
