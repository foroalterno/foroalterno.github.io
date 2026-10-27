import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Search, 
  ExternalLink, 
  Bot, 
  User, 
  RotateCcw,
  Zap,
  HelpCircle
} from 'lucide-react';
import { sendForoBotMessage, ChatMessage } from '../services/geminiService';

interface ForoBotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-init',
    sender: 'bot',
    text: `¡Qué pasa forero! 👋 Soy **ForoBot Alterno**, el asistente y compañero de fatigas de la comunidad.\n\nEstoy conectado con **Gemini 3.8 Flash** y con **Google Search** en tiempo real para resolverte dudas sobre motores, componentes de PC, debates de actualidad, o simplemente echarte una mano resumiendo o analizando temas.\n\n¿Qué se cuece hoy? ¿Buscas consejo sobre algún tema o quieres debatir?`,
    timestamp: 'Ahora',
  },
];

const SUGGESTED_QUESTIONS = [
  '¿Qué coche gasolina atmosférico recomiendas hoy?',
  'Configura un PC gaming para 1440p con 1.500€',
  '¿Por qué son tan míticos los foros españoles?',
  'Explica la etiqueta [TEMA SERIO] y cómo respetarla',
];

export const ForoBotDrawer: React.FC<ForoBotDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputVal('');
    setLoading(true);

    try {
      const { replyText, sources } = await sendForoBotMessage(messages, text);
      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources,
      };
      setMessages([...newHistory, botMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity animate-fadeIn">
      <div className="w-full max-w-lg bg-[#112239] text-white h-full shadow-2xl flex flex-col border-l border-blue-500/30">
        
        {/* Header */}
        <div className="p-4 bg-[#172e4d] border-b border-blue-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-slate-900 flex items-center justify-center font-bold shadow-md">
              <Sparkles className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-sm">
                <span>ForoBot Alterno</span>
                <span className="bg-blue-600/60 text-blue-200 text-[10px] px-1.5 py-0.2 rounded font-mono">
                  Gemini 3.8 Flash
                </span>
              </div>
              <div className="text-[11px] text-blue-300 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Google Search Grounding activo</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetChat}
              title="Reiniciar conversación"
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-white/10"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Thread Container */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'bot' && (
                <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center shrink-0 mt-1 font-bold">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-lg p-3 leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                    : 'bg-[#1c3659] text-slate-100 rounded-bl-none border border-slate-700/60 shadow-sm'
                }`}
              >
                <div className="whitespace-pre-line font-sans">{msg.text}</div>

                {/* Grounding web citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-blue-400/20 text-xs">
                    <div className="font-semibold text-sky-300 flex items-center gap-1 mb-1">
                      <Search className="w-3 h-3" />
                      <span>Fuentes de Google Search:</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      {msg.sources.map((src, i) => (
                        <a
                          key={i}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-400 hover:underline flex items-center gap-1 truncate text-[11px]"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">{src.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-[10px] text-right mt-1 opacity-60">
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-slate-400 text-xs">
              <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center shrink-0 font-bold animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#1c3659] p-3 rounded-lg flex items-center gap-2">
                <span className="animate-spin text-amber-300">⚙️</span>
                <span>ForoBot está consultando datos y redactando la respuesta...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Prompts pills */}
        {messages.length < 3 && (
          <div className="px-4 py-2 bg-[#0e1d31] border-t border-slate-800 flex gap-1.5 overflow-x-auto text-[11px]">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="bg-[#1c375c] hover:bg-blue-700 text-slate-200 px-2.5 py-1 rounded whitespace-nowrap transition-colors border border-blue-400/20"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-[#142740] border-t border-blue-900/60 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Escribe tu mensaje a ForoBot..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={loading}
            className="flex-1 bg-[#1e385b] text-white placeholder-slate-400 px-3 py-2.5 rounded text-xs sm:text-sm border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            disabled={loading || !inputVal.trim()}
            className="bg-amber-500 hover:bg-amber-400 text-slate-900 p-2.5 rounded font-bold transition-all disabled:opacity-40 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
