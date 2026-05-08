import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send, Trash2, Satellite, Newspaper, Users, Zap, Info } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useISS } from '../context/ISSContext';
import { useNews } from '../context/NewsContext';
import { useTheme } from '../context/ThemeContext';

export default function ChatbotPage() {
  const { messages, isTyping, sendMessage, clearChat } = useChat();
  const { issData, astronauts, fetchISS } = useISS();
  const { articles, fetchNews } = useNews();
  const { isDark } = useTheme();
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchISS();
    fetchNews();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    sendMessage(input.trim(), { issData, astronauts, articles });
    setInput('');
  };

  const suggestions = [
    { icon: Satellite, text: 'Where is the ISS right now?' },
    { icon: Zap, text: 'How fast is the ISS moving?' },
    { icon: Users, text: 'Who is currently on the ISS?' },
    { icon: Newspaper, text: 'Summarize the latest news for me.' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2"
            style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
            <Bot size={22} className="text-pink-400" />
            ARIA — AI Assistant
          </h1>
          <p className="text-sm mt-0.5" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
            Powered by Qwen 2.5 7B Instruct • Restricted to dashboard data only
          </p>
        </div>
        <button onClick={clearChat} className="btn-ghost text-red-400 border-red-400/20 hover:bg-red-400/10">
          <Trash2 size={14} /> Clear Chat
        </button>
      </motion.div>

      {/* Context status bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Satellite, label: 'ISS Data', ready: !!issData, color: '#06b6d4' },
          { icon: Users, label: `${astronauts.length} Crew`, ready: astronauts.length > 0, color: '#a855f7' },
          { icon: Newspaper, label: `${articles.length} Articles`, ready: articles.length > 0, color: '#f97316' },
        ].map(({ icon: Icon, label, ready, color }) => (
          <div key={label} className="flex items-center gap-2 p-3 rounded-xl border"
            style={{
              background: isDark ? 'rgba(4,17,40,0.6)' : 'rgba(255,255,255,0.7)',
              border: `1px solid ${ready ? color + '30' : 'rgba(99,102,241,0.1)'}`,
            }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: ready ? `${color}18` : 'rgba(99,102,241,0.06)' }}>
              <Icon size={13} style={{ color: ready ? color : '#475569' }} />
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>{label}</p>
              <p className="text-xs" style={{ color: ready ? '#10b981' : '#475569' }}>
                {ready ? '✓ Ready' : 'Loading...'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Chat area */}
      <div className="rounded-2xl border overflow-hidden"
        style={{
          background: isDark ? 'rgba(4,17,40,0.8)' : 'rgba(255,255,255,0.9)',
          border: '1px solid rgba(99,102,241,0.15)',
          height: 480,
          display: 'flex',
          flexDirection: 'column',
        }}>
        {/* Chat header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b"
          style={{ borderColor: 'rgba(99,102,241,0.12)', background: 'rgba(99,102,241,0.04)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>ARIA</p>
            <div className="flex items-center gap-1.5">
              <div className="live-dot w-1.5 h-1.5" />
              <span className="text-xs text-emerald-400">Online</span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1 text-xs px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
            <Info size={10} /> Context-aware only
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                <Bot size={28} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
                  Hi! I'm ARIA 👋
                </h3>
                <p className="text-sm" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                  I can only answer using live dashboard data.<br />
                  Try one of these:
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
                {suggestions.map(({ icon: Icon, text }) => (
                  <button key={text} onClick={() => sendMessage(text, { issData, astronauts, articles })}
                    className="flex items-center gap-2 p-3 rounded-xl text-left text-xs border transition-all hover:scale-[1.02]"
                    style={{
                      background: 'rgba(99,102,241,0.06)',
                      border: '1px solid rgba(99,102,241,0.15)',
                      color: isDark ? '#94a3b8' : '#64748b',
                    }}>
                    <Icon size={12} className="text-primary-400 flex-shrink-0" />
                    {text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-1"
                  style={{ background: msg.role === 'user' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                  <span className="text-white text-xs">{msg.role === 'user' ? '👤' : '🤖'}</span>
                </div>
                <div style={{ maxWidth: '75%' }}>
                  <div style={msg.role === 'user' ? {
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    borderRadius: '12px 4px 12px 12px',
                    padding: '10px 14px',
                    color: 'white',
                    fontSize: 13,
                    lineHeight: 1.6,
                  } : {
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: '4px 12px 12px 12px',
                    padding: '10px 14px',
                    color: isDark ? '#f1f5f9' : '#0f172a',
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}>
                    {msg.content}
                  </div>
                  <p className="text-xs mt-1 px-1" style={{ color: '#475569' }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))
          )}

          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
              <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                <span className="text-white text-xs">🤖</span>
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
        <div className="p-4 border-t" style={{ borderColor: 'rgba(99,102,241,0.12)' }}>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask about ISS location, crew, or news..."
              className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{
                background: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.04)',
                border: '1px solid rgba(99,102,241,0.2)',
                color: isDark ? '#f1f5f9' : '#0f172a',
              }}
            />
            <button onClick={handleSend} disabled={isTyping || !input.trim()}
              className="px-4 py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <Send size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
