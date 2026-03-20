
import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MessageSquare, Loader2, Bot, ChevronRight } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { ChatMessage, User, AssessmentResult, Course, QuizHistory } from '../types';

// Rate limiting for ChatBot
let lastChatRequestTime = 0;
const MIN_CHAT_REQUEST_INTERVAL = 3000; // 3 seconds between chat requests

const waitForChatRateLimit = () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastChatRequestTime;
  
  if (timeSinceLastRequest < MIN_CHAT_REQUEST_INTERVAL) {
    const waitTime = MIN_CHAT_REQUEST_INTERVAL - timeSinceLastRequest;
    return new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastChatRequestTime = Date.now();
  return Promise.resolve();
};

interface ChatBotProps {
  user: User | null;
  theme: 'light' | 'dark';
  activeResult: AssessmentResult | null;
  viewedCourses: Course[];
  history?: QuizHistory[];
}

const MarkdownLite: React.FC<{ text: string, theme: 'light' | 'dark' }> = ({ text, theme }) => {
  const lines = text.split('\n');
  
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        if (line.startsWith('### ')) {
          return <h4 key={i} className="text-sm font-black text-indigo-500 mt-4 mb-1 uppercase tracking-wider">{line.replace('### ', '')}</h4>;
        }
        
        const parts = line.split(/(\*\*.*?\*\*)/g);
        const formattedLine = parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className={`font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{part.slice(2, -2)}</strong>;
          }
          return part;
        });

        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          return (
            <div key={i} className="flex gap-2 pl-2">
              <div className="w-1 h-1 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
              <span className="flex-1">{formattedLine}</span>
            </div>
          );
        }

        if (/^\d+\.\s/.test(line.trim())) {
          const numMatch = line.match(/^\d+\./);
          const num = numMatch ? numMatch[0] : '';
          const rest = line.replace(/^\d+\.\s/, '');
          return (
            <div key={i} className="flex gap-2 pl-2 mt-2">
              <span className="font-black text-indigo-500 text-[10px] mt-0.5">{num}</span>
              <span className="flex-1 font-semibold">{rest}</span>
            </div>
          );
        }

        return <p key={i} className={line.trim() === '' ? 'h-2' : ''}>{formattedLine}</p>;
      })}
    </div>
  );
};

const ChatBot: React.FC<ChatBotProps> = ({ user, theme, activeResult, viewedCourses, history = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      const fullName = user?.name || 'Learner';
      setMessages([{ 
        role: 'model', 
        text: `Greetings, **${fullName}**! I'm your Strategist. \n\nI can help you build **roadmaps**, explain complex concepts, or find the right course from your viewing history. What's on your mind?` 
      }]);
    }
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const apiKey = import.meta.env.VITE_API_KEY;
    
    if (!apiKey) {
      setMessages(prev => [...prev, { role: 'user', text: userMessage }, { role: 'model', text: "API Key missing." }]);
      return;
    }

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      // Rate limiting
      await waitForChatRateLimit();
      
      const ai = new GoogleGenAI({ apiKey });
      
      const contextSummary = `
        User Name: ${user?.name || 'Learner'}
        Current Domain: ${activeResult?.domain || 'N/A'}
        Recent Score: ${activeResult?.overallScore || 'N/A'}%
        Strengths: ${activeResult?.strengths.join(', ') || 'N/A'}
        Weaknesses: ${activeResult?.weakAreas.join(', ') || 'N/A'}
        Viewed History: ${viewedCourses.map(c => c.title).join(', ') || 'None'}
      `;

      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: `You are the LearnPulse Strategist, an expert career and learning coach.
          
          OUTPUT RULES:
          1. NEVER write long paragraphs. Break information into structured chunks.
          2. For ROADMAPS: Use numbered lists (1. 2. 3.). Each step must have a **Bold Title** followed by a 1-sentence action. Use emojis.
          3. For CONCEPT EXPLANATIONS: Use a 1-sentence "Quick Definition" followed by a bulleted list of 3 key points.
          4. For COURSE ADVICE: Reference the user's "Viewed History" specifically if relevant.
          5. Always use Markdown for emphasis: **bold** for key terms, ### for section headers.
          6. Reference the user's current context: ${contextSummary}.
          7. Be concise, actionable, and encouraging.`,
        },
      });

      const response = await chat.sendMessage({ message: userMessage });
      const text = response.text || "Recalibrating systems. Please rephrase.";
      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "System bottleneck encountered. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className={`mb-6 w-[320px] sm:w-[420px] h-[600px] rounded-[1.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] border flex flex-col overflow-hidden animate-in slide-in-from-bottom-12 duration-500 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <div className={`p-6 text-white flex items-center justify-between border-b ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-900 border-white/10'}`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-black text-base tracking-tight leading-tight">Strategist</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[8px] text-emerald-500 font-black uppercase tracking-[0.2em]">Neural Engine v3</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-lg transition-all active:scale-90"><X className="w-5 h-5" /></button>
          </div>
          
          <div className={`flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar ${theme === 'dark' ? 'bg-slate-900/50' : 'bg-slate-50/10'}`}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[92%] p-4 rounded-2xl text-[12px] leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : (theme === 'dark' ? 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none')
                }`}>
                   {msg.role === 'model' ? <MarkdownLite text={msg.text} theme={theme} /> : msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className={`px-4 py-3 rounded-2xl rounded-tl-none border shadow-sm flex items-center gap-2 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-indigo-200 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={`p-4 border-t ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="relative flex items-center">
              <input 
                type="text" 
                placeholder="Ask for a roadmap or explanation..." 
                className={`w-full border rounded-xl py-4 pl-5 pr-12 text-xs font-bold outline-none transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white focus:ring-indigo-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-50'}`} 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleSend()} 
              />
              <button 
                onClick={handleSend} 
                disabled={!input.trim() || loading} 
                className="absolute right-2.5 p-2 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 active:scale-90 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[8px] text-center text-slate-400 font-bold uppercase tracking-widest mt-3">Powered by Gemini 3 Flash</p>
          </div>
        </div>
      )}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-90 ${
          isOpen ? (theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-slate-900 text-white') : 'bg-indigo-600 text-white animate-bounce shadow-indigo-200'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default ChatBot;
