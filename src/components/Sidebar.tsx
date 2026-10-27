import React, { useState } from 'react';
import { 
  BarChart2, 
  Users, 
  Flame, 
  Sparkles, 
  ShieldAlert, 
  Clock, 
  ArrowRight,
  Send,
  MessageSquare
} from 'lucide-react';
import { ForumStats, Thread } from '../types/forum';

interface SidebarProps {
  stats: ForumStats;
  recentThreads: Thread[];
  onSelectThread: (threadId: string) => void;
  onOpenBot: () => void;
  onOpenRules: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  stats,
  recentThreads,
  onSelectThread,
  onOpenBot,
  onOpenRules,
}) => {
  const [quickBotQuery, setQuickBotQuery] = useState('');

  const handleQuickBotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickBotQuery.trim()) {
      onOpenBot();
    }
  };

  return (
    <aside className="space-y-5">
      {/* 1. ForoBot AI Assistant Widget */}
      <div className="bg-gradient-to-br from-[#1a365d] to-[#254b73] text-white rounded-lg shadow-sm border border-blue-400/30 overflow-hidden">
        <div className="p-4 border-b border-blue-400/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-300 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">ForoBot Alterno</h3>
              <p className="text-[11px] text-blue-200">Gemini 3.8 Flash + Google Search</p>
            </div>
          </div>
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-mono px-1.5 py-0.5 rounded">
            ONLINE
          </span>
        </div>

        <div className="p-4 space-y-3 text-xs">
          <p className="text-blue-100 leading-relaxed">
            ¿Dudas sobre mecánica, presupuestos de PC o el mejor hilo del día? Pregúntale a nuestro forero con IA.
          </p>

          <form onSubmit={handleQuickBotSubmit} className="relative">
            <input
              type="text"
              placeholder="Pregunta a ForoBot..."
              value={quickBotQuery}
              onChange={(e) => setQuickBotQuery(e.target.value)}
              className="w-full bg-[#132742] text-xs text-white placeholder-slate-400 pl-3 pr-8 py-2 rounded border border-blue-500/40 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 text-amber-300 hover:text-white"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          <button
            onClick={onOpenBot}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-1.5 rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Abrir Chat con ForoBot</span>
          </button>
        </div>
      </div>

      {/* 2. Últimos Mensajes Activos */}
      <div className="bg-white rounded-lg shadow-xs border border-slate-300 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-100 to-slate-200 px-4 py-2.5 border-b border-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wide text-slate-700">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Últimos Mensajes</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">En vivo</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {recentThreads.slice(0, 5).map((t) => (
            <div
              key={t.id}
              onClick={() => onSelectThread(t.id)}
              className="p-3 hover:bg-blue-50/60 transition-colors cursor-pointer space-y-1"
            >
              <div className="font-semibold text-slate-800 hover:text-blue-600 line-clamp-2 leading-snug">
                {t.title}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="text-slate-600 font-medium truncate max-w-[120px]">
                  {t.lastReplyAuthorName || t.authorName}
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <MessageSquare className="w-3 h-3 text-slate-400" />
                  {t.replyCount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Estadísticas del Foro */}
      <div className="bg-white rounded-lg shadow-xs border border-slate-300 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-100 to-slate-200 px-4 py-2.5 border-b border-slate-300 flex items-center gap-2 font-bold text-xs uppercase tracking-wide text-slate-700">
          <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
          <span>Estadísticas del Foro</span>
        </div>

        <div className="p-4 space-y-2.5 text-xs text-slate-600">
          <div className="flex justify-between items-center py-1 border-b border-slate-100">
            <span>Hilos activos:</span>
            <span className="font-bold text-slate-800 font-mono">{recentThreads.length}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-100">
            <span>Respuestas totales:</span>
            <span className="font-bold text-slate-800 font-mono">
              {recentThreads.reduce((acc, t) => acc + (t.replyCount || 0), 0)}
            </span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-100">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Estado del Foro:
            </span>
            <span className="font-bold text-emerald-600 font-mono">Activo</span>
          </div>
        </div>
      </div>

      {/* 4. Banner Normas / Conducta */}
      <div 
        onClick={onOpenRules}
        className="bg-amber-50 hover:bg-amber-100/80 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-900 cursor-pointer transition-colors flex items-start gap-3"
      >
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold">Reglas de Convivencia</div>
          <p className="text-[11px] text-amber-800/90 mt-0.5 leading-relaxed">
            Prohibido faltar al respeto en [TEMA SERIO]. Haz clic para leer los rangos y normas de Foro Alterno.
          </p>
        </div>
      </div>
    </aside>
  );
};
