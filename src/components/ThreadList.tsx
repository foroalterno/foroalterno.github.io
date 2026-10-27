import React, { useState } from 'react';
import { 
  Pin, 
  Flame, 
  MessageSquare, 
  Eye, 
  Clock, 
  PlusCircle, 
  Filter, 
  ArrowLeft,
  Search,
  CheckCircle2
} from 'lucide-react';
import { Thread, Category, ThreadPrefix } from '../types/forum';

interface ThreadListProps {
  category: Category | null;
  threads: Thread[];
  currentFilterTitle?: string;
  onSelectThread: (threadId: string) => void;
  onCreateThread: () => void;
  onBackToHome: () => void;
}

// Prefix badge styling helper
export const renderPrefixBadge = (prefix?: ThreadPrefix) => {
  if (!prefix) return null;

  let colorClass = 'bg-slate-200 text-slate-700 border-slate-300';
  switch (prefix) {
    case 'TEMA SERIO':
      colorClass = 'bg-red-600 text-white border-red-700 font-bold';
      break;
    case '+HD':
      colorClass = 'bg-sky-500 text-white border-sky-600 font-bold';
      break;
    case 'OFICIAL':
      colorClass = 'bg-emerald-600 text-white border-emerald-700 font-bold';
      break;
    case 'DEBATE':
      colorClass = 'bg-amber-600 text-white border-amber-700 font-bold';
      break;
    case 'DUDA':
      colorClass = 'bg-indigo-600 text-white border-indigo-700 font-semibold';
      break;
    case 'NOTICIA':
      colorClass = 'bg-blue-600 text-white border-blue-700 font-semibold';
      break;
    case '+18':
      colorClass = 'bg-purple-700 text-white border-purple-800 font-bold';
      break;
    case 'BRICO':
      colorClass = 'bg-teal-600 text-white border-teal-700 font-bold';
      break;
  }

  return (
    <span className={`inline-block px-1.5 py-0.5 text-[10px] tracking-wide uppercase rounded border ${colorClass} shrink-0`}>
      [{prefix}]
    </span>
  );
};

export const ThreadList: React.FC<ThreadListProps> = ({
  category,
  threads,
  currentFilterTitle,
  onSelectThread,
  onCreateThread,
  onBackToHome,
}) => {
  const [filterPrefix, setFilterPrefix] = useState<string>('all');
  const [searchLocal, setSearchLocal] = useState<string>('');

  // Filter threads
  const filteredThreads = threads.filter((t) => {
    if (filterPrefix !== 'all' && t.prefix !== filterPrefix) return false;
    if (searchLocal.trim()) {
      const q = searchLocal.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.authorName.toLowerCase().includes(q) ||
        t.content.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Category / Filter Header Banner */}
      <div className="bg-gradient-to-r from-[#1b3552] via-[#21436a] to-[#2b5a8c] text-white p-4 sm:p-5 rounded-lg shadow-sm border border-slate-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={onBackToHome}
                className="text-blue-300 hover:text-white flex items-center gap-1 text-xs cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a Foros</span>
              </button>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {category ? category.name : currentFilterTitle || 'Listado de Temas'}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-2xl">
              {category?.description || 'Explora todos los hilos y debates activos en la comunidad de Foro Alterno.'}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={onCreateThread}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-emerald-200" />
              <span>Crear Nuevo Tema</span>
            </button>
          </div>
        </div>

        {/* Subforums pills if inside category */}
        {category?.subforums && category.subforums.length > 0 && (
          <div className="mt-4 pt-3 border-t border-blue-400/30 flex items-center flex-wrap gap-2 text-xs">
            <span className="text-blue-200 font-semibold">Subsecciones:</span>
            {category.subforums.map((sub, i) => (
              <span
                key={i}
                className="bg-blue-900/40 text-blue-100 px-2 py-0.5 rounded border border-blue-400/40 text-[11px]"
              >
                {sub}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-2.5 rounded-lg border border-slate-300 shadow-xs flex flex-col md:flex-row items-center justify-between gap-2 text-xs">
        {/* Quick prefix filter pills */}
        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto overflow-x-auto">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filtro:
          </span>
          <button
            onClick={() => setFilterPrefix('all')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              filterPrefix === 'all'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos
          </button>
          {['TEMA SERIO', '+HD', 'OFICIAL', 'DEBATE', 'DUDA'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPrefix(p)}
              className={`px-2 py-1 rounded transition-colors cursor-pointer text-[11px] ${
                filterPrefix === p
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              [{p}]
            </button>
          ))}
        </div>

        {/* Local search within category */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Filtrar en esta sección..."
            value={searchLocal}
            onChange={(e) => setSearchLocal(e.target.value)}
            className="w-full bg-slate-50 text-slate-700 text-xs pl-8 pr-3 py-1.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
        </div>
      </div>

      {/* Threads Table Card */}
      <div className="bg-white rounded-lg shadow-xs border border-slate-300 overflow-hidden">
        {/* Table Column Titles */}
        <div className="hidden md:grid grid-cols-12 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-wider py-2 px-4 border-b border-slate-300">
          <div className="col-span-7">Título del Hilo / Creador</div>
          <div className="col-span-2 text-center">Respuestas / Visitas</div>
          <div className="col-span-3 text-right">Último Mensaje</div>
        </div>

        {/* Rows */}
        {filteredThreads.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-600">No hay hilos en esta sección todavía</p>
            <p className="text-xs text-slate-400 mt-1">Sé el primero en iniciar un debate haciendo clic en "Crear Nuevo Tema".</p>
            <button
              onClick={onCreateThread}
              className="mt-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded shadow cursor-pointer"
            >
              Crear el primer hilo
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredThreads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => onSelectThread(thread.id)}
                className={`grid grid-cols-1 md:grid-cols-12 p-3 sm:p-4 hover:bg-blue-50/60 transition-colors cursor-pointer items-center gap-2 md:gap-0 ${
                  thread.isPinned ? 'bg-amber-50/40' : ''
                }`}
              >
                {/* Left: Prefix, Title & Author */}
                <div className="col-span-1 md:col-span-7 flex items-start gap-3">
                  {/* Status / Pin Icon */}
                  <div className="shrink-0 mt-0.5">
                    {thread.isPinned ? (
                      <span title="Hilo con chincheta (Fijo)">
                        <Pin className="w-4 h-4 text-amber-600 fill-amber-500 rotate-45" />
                      </span>
                    ) : (
                      <MessageSquare className="w-4 h-4 text-slate-400" />
                    )}
                  </div>

                  {/* Title & Metadata */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {renderPrefixBadge(thread.prefix)}
                      <h2 
                        className={`font-semibold text-slate-900 text-sm hover:text-blue-700 transition-colors leading-snug ${
                          thread.isPinned ? 'font-bold' : ''
                        }`}
                      >
                        {thread.title}
                      </h2>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center flex-wrap gap-2 mt-1">
                      <span>Iniciado por <strong className="text-slate-700">{thread.authorName}</strong></span>
                      <span>•</span>
                      <span>{new Date(thread.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
                      {thread.likeCount > 0 && (
                        <span className="text-emerald-700 font-semibold bg-emerald-50 px-1 rounded">
                          +{thread.likeCount} dies
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Middle: Reply & View stats */}
                <div className="hidden md:flex col-span-2 flex-col items-center justify-center text-center">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-slate-400" />
                    {thread.replyCount}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Eye className="w-3 h-3 text-slate-300" />
                    {thread.viewCount} vistas
                  </div>
                </div>

                {/* Right: Last reply info */}
                <div className="col-span-1 md:col-span-3 text-left md:text-right text-xs">
                  <div className="text-[11px] text-slate-700 font-medium">
                    {thread.lastReplyAuthorName ? (
                      <>
                        <span>Por </span>
                        <strong className="text-blue-700">{thread.lastReplyAuthorName}</strong>
                      </>
                    ) : (
                      <span>Por <strong className="text-slate-700">{thread.authorName}</strong></span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center md:justify-end gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{thread.lastReplyAt || 'Hace unos momentos'}</span>
                  </div>
                </div>

                {/* Mobile stats row */}
                <div className="flex md:hidden items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span className="font-semibold text-slate-700">{thread.replyCount} respuestas • {thread.viewCount} visitas</span>
                  <span className="text-blue-600 font-bold">Leer hilo &rarr;</span>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
