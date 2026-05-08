import { createContext, useContext, useState, useCallback } from 'react';

const ChatContext = createContext(null);

const STORAGE_KEY = 'chatbot_messages';
const MAX_MESSAGES = 30;

const SYSTEM_PROMPT = `You are ARIA (Automated Real-time Intelligence Assistant), an AI assistant embedded in a space-tech dashboard. You ONLY answer questions using the live dashboard data provided to you.

STRICT RULES:
1. You can ONLY discuss: ISS location, ISS speed, ISS altitude, astronaut names/count, news articles from the dashboard.
2. If asked anything outside these topics, politely say: "I can only help you with ISS tracking data and current news from the dashboard."
3. NEVER make up information. NEVER guess. NEVER use external knowledge.
4. Keep responses concise, friendly, and informative.
5. Always reference actual numbers from the context.

Current Dashboard Context:
{{CONTEXT}}

Answer based ONLY on the above context.`;

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const saveMessages = (msgs) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-MAX_MESSAGES)));
    } catch { /* ignore */ }
  };

  const addMessage = (role, content) => {
    const msg = { role, content, timestamp: new Date().toISOString(), id: Date.now() };
    setMessages(prev => {
      const updated = [...prev, msg].slice(-MAX_MESSAGES);
      saveMessages(updated);
      return updated;
    });
    return msg;
  };

  const buildContext = (dashboardData) => {
    const { issData, astronauts, articles } = dashboardData;
    let ctx = '';

    if (issData) {
      ctx += `ISS LIVE DATA:
- Latitude: ${issData.lat?.toFixed(4)}°
- Longitude: ${issData.lon?.toFixed(4)}°
- Altitude: ${issData.altitude?.toFixed(2)} km
- Speed: ${issData.speed} km/h
`;
    }

    if (astronauts?.length) {
      ctx += `\nASTRONAUTS IN SPACE: ${astronauts.length} total
Names: ${astronauts.map(a => a.name).join(', ')}
`;
    }

    if (articles?.length) {
      ctx += `\nNEWS ARTICLES (${articles.length} total):\n`;
      articles.slice(0, 5).forEach((a, i) => {
        ctx += `${i + 1}. "${a.title}" - Source: ${a.source_id || 'Unknown'}, Date: ${a.pubDate || 'N/A'}
`;
      });
    }

    return ctx || 'No dashboard data available yet.';
  };

  const sendMessage = useCallback(async (userInput, dashboardData) => {
    const userMsg = addMessage('user', userInput);

    setIsTyping(true);
    try {
      const context = buildContext(dashboardData);
      const systemWithContext = SYSTEM_PROMPT.replace('{{CONTEXT}}', context);

      // Build conversation for Hugging Face
      const conversationHistory = messages.slice(-8).map(m => ({
        role: m.role === 'bot' ? 'assistant' : m.role,
        content: m.content,
      }));

      // /api/chat is handled by:
      //   dev  → Vite proxy (vite.config.js) injects HF_TOKEN and forwards to HF
      //   prod → Vercel serverless function (api/chat.js) injects HF_TOKEN server-side
      // The HF token is NEVER sent from the browser in either environment.
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'Qwen/Qwen2.5-7B-Instruct',
          messages: [
            { role: 'system', content: systemWithContext },
            ...conversationHistory,
            { role: 'user', content: userInput },
          ],
          max_tokens: 350,
          temperature: 0.3,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API error ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const botReply = data.choices?.[0]?.message?.content?.trim() || 'I encountered an issue processing your request.';
      addMessage('bot', botReply);
    } catch (err) {
      console.error('Chat error:', err);
      addMessage('bot', '⚠️ I\'m having trouble connecting to my AI backend. Please check your API key or try again.');
    } finally {
      setIsTyping(false);
    }
  }, [messages]);

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <ChatContext.Provider value={{
      messages, isTyping, isOpen, setIsOpen,
      sendMessage, clearChat
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be inside ChatProvider');
  return ctx;
};
