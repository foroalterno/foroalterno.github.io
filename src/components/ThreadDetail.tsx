import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MessageSquare, 
  Heart, 
  Quote, 
  Share2, 
  Flag, 
  Sparkles, 
  Search, 
  Clock, 
  CheckCircle, 
  Send, 
  Eye, 
  Bold, 
  Italic, 
  Link2, 
  Image as ImageIcon,
  HelpCircle,
  ExternalLink,
  Lock
} from 'lucide-react';
import { Thread, Reply, Category, GroundingSource } from '../types/forum';
import { useAuth } from '../context/AuthContext';
import { renderPrefixBadge } from './ThreadList';
import { summarizeThreadWithAI, getVerifiedFacts } from '../services/geminiService';

interface ThreadDetailProps {
  thread: Thread;
  replies: Reply[];
  category?: Category;
  onBackToCategory: () => void;
  onPostReply: (content: string, quote?: { authorName: string; content: string }) => Promise<void>;
  onLikeThread: (threadId: string) => void;
  onLikeReply: (replyId: string) => void;
  likedThreadIds: Set<string>;
  likedReplyIds: Set<string>;
}

export const ThreadDetail: React.FC<ThreadDetailProps> = ({
  thread,
  replies,
  category,
  onBackToCategory,
  onPostReply,
  onLikeThread,
  onLikeReply,
  likedThreadIds,
  likedReplyIds,
}) => {
  const { currentUser, userProfile, openAuthModal } = useAuth();
  
  // Quick reply state
  const [replyText, setReplyText] = useState('');
  const [activeQuote, setActiveQuote] = useState<{ authorName: string; content: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Gemini AI features state
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [verifiedFacts, setVerifiedFacts] = useState<{ text: string; sources: GroundingSource[] } | null>(null);
  const [isFactChecking, setIsFactChecking] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleQuoteClick = (authorName: string, content: string) => {
    setActiveQuote({
      authorName,
      content: content.length > 250 ? content.substring(0, 250) + '...' : content,
    });
    // Scroll to quick reply box
    document.getElementById('quick-reply-box')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSummarizeThread = async () => {
    if (aiSummary) {
      setAiSummary(null);
      return;
    }
    setIsSummarizing(true);
    const repliesSample = replies.map(r => `${r.authorName}: ${r.content}`);
    const summary = await summarizeThreadWithAI(thread.title, thread.content, repliesSample);
    setAiSummary(summary);
    setIsSummarizing(false);
  };

  const handleVerifyFacts = async () => {
    if (verifiedFacts) {
      setVerifiedFacts(null);
      return;
    }
    setIsFactChecking(true);
    const facts = await getVerifiedFacts(thread.title);
    setVerifiedFacts(facts);
    setIsFactChecking(false);
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      openAuthModal('login');
      return;
    }
    if (!replyText.trim()) return;

    try {
      setIsSubmitting(true);
      await onPostReply(replyText, activeQuote || undefined);
      setReplyText('');
      setActiveQuote(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick formatting toolbar buttons
  const insertFormatting = (tag: 'b' | 'i' | 'quote' | 'spoiler') => {
    if (tag === 'b') setReplyText(prev => prev + ' [b]texto en negrita[/b] ');
    if (tag === 'i') setReplyText(prev => prev + ' [i]texto en cursiva[/i] ');
    if (tag === 'quote') setReplyText(prev => prev + ' [quote]Cita aquí[/quote] ');
    if (tag === 'spoiler') setReplyText(prev => prev + ' [spoiler]Contenido oculto[/spoiler] ');
  };

  const insertImage = () => {
    const url = prompt('Introduce la URL de la imagen (ej: https://.../foto.jpg):');
    if (url && url.trim()) {
      setReplyText(prev => prev + `\n[img]${url.trim()}[/img]\n`);
    }
  };

  const handleLocalImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen seleccionada supera los 2 MB recomendados.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setReplyText(prev => prev + `\n[img]${reader.result}[/img]\n`);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Helper to render text with images support
  const renderMessageContent = (rawText: string) => {
    const imgRegex = /\[img\](.*?)\[\/img\]/gi;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = imgRegex.exec(rawText)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={`txt-${lastIndex}`} className="whitespace-pre-line">
            {rawText.substring(lastIndex, match.index)}
          </span>
        );
      }
      const url = match[1].trim();
      parts.push(
        <div key={`img-${match.index}`} className="my-3">
          <img
            src={url}
            alt="Imagen del mensaje"
            className="max-w-full max-h-[480px] rounded-lg border border-slate-300 shadow-xs object-contain"
          />
        </div>
      );
      lastIndex = imgRegex.lastIndex;
    }

    if (lastIndex < rawText.length) {
      parts.push(
        <span key={`txt-end`} className="whitespace-pre-line">
          {rawText.substring(lastIndex)}
        </span>
      );
    }

    return parts;
  };

  return (
    <div className="space-y-4">
      {/* Thread Title & Header Bar */}
      <div className="bg-white rounded-lg shadow-xs border border-slate-300 overflow-hidden">
        <div className="bg-gradient-to-r from-[#1b3552] to-[#254b73] text-white p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <button
              onClick={onBackToCategory}
              className="text-blue-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a {category?.name || 'Foros'}</span>
            </button>

            {/* AI Assistant Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSummarizeThread}
                disabled={isSummarizing}
                className="bg-blue-900/60 hover:bg-blue-800 text-amber-200 border border-blue-400/40 text-xs px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                title="Resumir el hilo con Gemini 3.8 Flash"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>{isSummarizing ? 'Resumiendo...' : aiSummary ? 'Ocultar Resumen' : 'Resumir Hilo con IA'}</span>
              </button>

              <button
                onClick={handleVerifyFacts}
                disabled={isFactChecking}
                className="bg-blue-900/60 hover:bg-blue-800 text-sky-200 border border-blue-400/40 text-xs px-2.5 py-1 rounded hidden sm:flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                title="Buscar datos con Google Search Grounding"
              >
                <Search className="w-3.5 h-3.5 text-sky-300" />
                <span>{isFactChecking ? 'Consultando...' : verifiedFacts ? 'Ocultar Datos' : 'Verificar en Google'}</span>
              </button>
            </div>
          </div>

          {/* Title & Badge */}
          <div className="flex items-start gap-2 flex-wrap">
            {renderPrefixBadge(thread.prefix)}
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-white leading-snug">
              {thread.title}
            </h1>
          </div>

          {/* Subtitle Stats */}
          <div className="flex items-center flex-wrap gap-4 text-xs text-blue-200/90 mt-2.5 pt-2 border-t border-blue-400/20">
            <span>Iniciado por <strong className="text-white">{thread.authorName}</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(thread.createdAt).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
            <span>•</span>
            <span>{thread.replyCount} respuestas</span>
            <span>•</span>
            <span>{thread.viewCount} visitas</span>
            <button
              onClick={handleShare}
              className="ml-auto text-blue-200 hover:text-white flex items-center gap-1 text-xs cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? '¡Enlace copiado!' : 'Compartir'}</span>
            </button>
          </div>
        </div>

        {/* Expandable AI Summary Box */}
        {aiSummary && (
          <div className="bg-amber-50 border-b border-amber-200 p-4 text-slate-800 text-xs sm:text-sm animate-fadeIn">
            <div className="flex items-center gap-2 font-bold text-amber-900 mb-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Resumen del Hilo por ForoBot Alterno (Gemini 3.8 Flash):</span>
            </div>
            <div className="whitespace-pre-line leading-relaxed text-slate-700 bg-white/70 p-3 rounded border border-amber-200 font-sans">
              {aiSummary}
            </div>
          </div>
        )}

        {/* Expandable Google Search Grounding Box */}
        {verifiedFacts && (
          <div className="bg-sky-50 border-b border-sky-200 p-4 text-slate-800 text-xs sm:text-sm animate-fadeIn">
            <div className="flex items-center gap-2 font-bold text-sky-900 mb-2">
              <Search className="w-4 h-4 text-sky-600" />
              <span>Datos contrastados en tiempo real (Google Search Grounding):</span>
            </div>
            <div className="whitespace-pre-line leading-relaxed text-slate-700 bg-white/70 p-3 rounded border border-sky-200">
              {verifiedFacts.text}
            </div>
            {verifiedFacts.sources.length > 0 && (
              <div className="mt-2 text-xs text-sky-800">
                <span className="font-semibold">Fuentes consultadas:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {verifiedFacts.sources.map((src, i) => (
                    <a
                      key={i}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sky-700 hover:underline bg-sky-100 px-2 py-0.5 rounded text-[11px]"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {src.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* POST #1 (OP: Original Post) */}
      <div className="bg-white rounded-lg shadow-xs border border-slate-300 overflow-hidden">
        {/* Post Top Header */}
        <div className="bg-slate-100 px-4 py-2 text-xs text-slate-600 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-blue-700">#1</span>
            <span>•</span>
            <span>{new Date(thread.createdAt).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded text-[10px] font-bold">OP</span>
          </div>
        </div>

        {/* Post Body: Two-Column ForoParalelo classic layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          
          {/* Left Column: Author Info Card */}
          <div className="md:col-span-3 p-4 bg-slate-50/70 flex md:flex-col items-center md:items-start gap-3 md:gap-2 text-xs">
            <div className="relative">
              <img
                src={thread.authorAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${thread.authorId}`}
                alt={thread.authorName}
                className="w-14 h-14 md:w-20 md:h-20 rounded-md object-cover border-2 border-slate-300 shadow-xs"
              />
              <span 
                className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" 
                title="Usuario activo"
              />
            </div>

            <div className="flex-1 md:flex-initial">
              <div className="font-bold text-sm text-slate-800">{thread.authorName}</div>
              <div className="text-[11px] text-blue-600 font-semibold">{thread.authorTitle || 'Forero Alterno'}</div>
              {thread.authorRole === 'admin' && (
                <span className="inline-block mt-1 bg-red-600 text-white text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase">
                  Administrador
                </span>
              )}
              
              <div className="hidden md:block mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-500 space-y-1 w-full font-mono">
                <div>Registro: <span className="text-slate-700 font-sans">Oct 2024</span></div>
                <div>Mensajes: <span className="text-slate-700 font-semibold">1,240</span></div>
                <div>Mis dies: <span className="text-emerald-700 font-semibold">+{thread.likeCount + 45}</span></div>
              </div>
            </div>
          </div>

          {/* Right Column: Message Content & Signature & Action Footer */}
          <div className="md:col-span-9 p-4 sm:p-5 flex flex-col justify-between min-h-[180px]">
            <div className="space-y-4">
              {/* Message text with formatting & images */}
              <div className="text-sm sm:text-base text-slate-800 leading-relaxed font-sans">
                {renderMessageContent(thread.content)}
              </div>

              {/* Author Signature */}
              <div className="mt-8 pt-4 border-t border-slate-200 text-xs text-slate-500 italic">
                «Viviendo en Foro Alterno. Un saludo a todos los foreros de bien.»
              </div>
            </div>

            {/* Post Footer Toolbar */}
            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onLikeThread(thread.id)}
                  className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-semibold transition-all cursor-pointer ${
                    likedThreadIds.has(thread.id)
                      ? 'bg-rose-100 text-rose-700 border border-rose-300'
                      : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600 border border-slate-200'
                  }`}
                  title="Dar mis dies al OP"
                >
                  <Heart className={`w-3.5 h-3.5 ${likedThreadIds.has(thread.id) ? 'fill-rose-600 text-rose-600' : ''}`} />
                  <span>Dar mis dies ({thread.likeCount})</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuoteClick(thread.authorName, thread.content)}
                  className="px-2.5 py-1.5 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                >
                  <Quote className="w-3.5 h-3.5" />
                  <span>Citar</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* REPLIES LIST */}
      {replies.map((reply, index) => {
        const postNum = index + 2;
        const isLiked = likedReplyIds.has(reply.id);

        return (
          <div 
            key={reply.id} 
            id={`post-${reply.id}`}
            className="bg-white rounded-lg shadow-xs border border-slate-300 overflow-hidden"
          >
            {/* Post Header Bar */}
            <div className="bg-slate-100 px-4 py-2 text-xs text-slate-600 flex items-center justify-between border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-700">#{postNum}</span>
                <span>•</span>
                <span>{new Date(reply.createdAt).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Respuesta
              </div>
            </div>

            {/* Post Two-Column */}
            <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200">
              {/* Author Column */}
              <div className="md:col-span-3 p-4 bg-slate-50/70 flex md:flex-col items-center md:items-start gap-3 md:gap-2 text-xs">
                <div className="relative">
                  <img
                    src={reply.authorAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${reply.authorId}`}
                    alt={reply.authorName}
                    className="w-12 h-12 md:w-16 md:h-16 rounded-md object-cover border border-slate-300"
                  />
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                </div>

                <div className="flex-1 md:flex-initial">
                  <div className="font-bold text-sm text-slate-800">{reply.authorName}</div>
                  <div className="text-[11px] text-slate-500 font-medium">{reply.authorTitle || 'Forero'}</div>
                  {reply.authorRole === 'admin' && (
                    <span className="inline-block mt-1 bg-red-600 text-white text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase">
                      Admin
                    </span>
                  )}
                </div>
              </div>

              {/* Content Column */}
              <div className="md:col-span-9 p-4 sm:p-5 flex flex-col justify-between min-h-[150px]">
                <div className="space-y-3">
                  
                  {/* Quoted block if any */}
                  {reply.quoteContent && (
                    <div className="bg-slate-100 border-l-4 border-blue-500 p-3 rounded-r text-xs text-slate-700 space-y-1">
                      <div className="font-bold text-blue-900 flex items-center gap-1">
                        <Quote className="w-3 h-3" />
                        <span>Iniciado por {reply.quoteAuthor || 'un forero'}:</span>
                      </div>
                      <p className="italic text-slate-600">{reply.quoteContent}</p>
                    </div>
                  )}

                  {/* Reply text with images support */}
                  <div className="text-sm text-slate-800 leading-relaxed font-sans">
                    {renderMessageContent(reply.content)}
                  </div>

                  {/* Signature */}
                  {reply.authorSignature && (
                    <div className="mt-6 pt-3 border-t border-slate-200 text-xs text-slate-400 italic">
                      {reply.authorSignature}
                    </div>
                  )}
                </div>

                {/* Footer Toolbar */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <button
                    onClick={() => onLikeReply(reply.id)}
                    className={`px-2.5 py-1 rounded flex items-center gap-1.5 font-semibold transition-colors cursor-pointer ${
                      isLiked
                        ? 'bg-rose-100 text-rose-700 border border-rose-300'
                        : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600 border border-slate-200'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                    <span>+{reply.likeCount} dies</span>
                  </button>

                  <button
                    onClick={() => handleQuoteClick(reply.authorName, reply.content)}
                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                  >
                    <Quote className="w-3.5 h-3.5" />
                    <span>Citar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* QUICK REPLY BOX OR LOCKED BANNER */}
      {thread.isLocked ? (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-5 text-center text-red-900 shadow-xs">
          <div className="flex items-center justify-center gap-2 font-bold text-sm sm:text-base mb-1">
            <Lock className="w-5 h-5 text-red-600" />
            <span>Hilo Cerrado por la Administración</span>
          </div>
          <p className="text-xs text-red-700 max-w-md mx-auto">
            Este tema ha sido bloqueado por el equipo de moderación. El contenido permanece visible como archivo de consulta pero no se admiten nuevas respuestas.
          </p>
        </div>
      ) : (
        <div id="quick-reply-box" className="bg-white rounded-lg shadow-xs border border-slate-300 overflow-hidden">
          <div className="bg-gradient-to-r from-[#1e3e62] to-[#28537d] text-white px-4 py-2.5 font-bold text-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-300" />
            <span>Respuesta Rápida al Tema</span>
          </div>

          <form onSubmit={handleReplySubmit} className="p-4 sm:p-5 space-y-3">
            {/* Active quote banner */}
            {activeQuote && (
              <div className="bg-blue-50 border border-blue-200 p-2.5 rounded flex items-center justify-between text-xs text-blue-900">
                <div className="truncate">
                  <span className="font-bold">Citando a {activeQuote.authorName}: </span>
                  <span className="italic text-slate-600">"{activeQuote.content}"</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveQuote(null)}
                  className="text-red-600 font-bold hover:underline shrink-0 ml-2"
                >
                  Eliminar cita
                </button>
              </div>
            )}

            {/* BBCode / Formatting Toolbar */}
            <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200 text-slate-600">
              <button
                type="button"
                onClick={() => insertFormatting('b')}
                className="p-1.5 hover:bg-slate-100 rounded text-slate-700 font-bold"
                title="Negrita [b]"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('i')}
                className="p-1.5 hover:bg-slate-100 rounded text-slate-700 italic"
                title="Cursiva [i]"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('quote')}
                className="p-1.5 hover:bg-slate-100 rounded text-slate-700"
                title="Cita [quote]"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={insertImage}
                className="p-1.5 hover:bg-blue-50 rounded text-blue-700 flex items-center gap-1 text-xs"
                title="Insertar Imagen por URL [img]"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">URL Foto</span>
              </button>
              <label
                className="p-1.5 hover:bg-blue-50 rounded text-blue-700 flex items-center gap-1 text-xs cursor-pointer"
                title="Subir foto desde tu dispositivo"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLocalImageSelect}
                  className="hidden"
                />
                <span className="text-[11px] font-semibold text-blue-600 hover:underline">+ Subir</span>
              </label>
              <button
                type="button"
                onClick={() => insertFormatting('spoiler')}
                className="px-2 py-1 text-xs hover:bg-slate-100 rounded text-slate-700 font-mono"
                title="Spoiler"
              >
                [spoiler]
              </button>
              <span className="text-slate-300">|</span>
              <span className="text-[11px] text-slate-400">
                {currentUser ? `Publicando como: ${userProfile?.displayName || currentUser.displayName}` : 'Debes iniciar sesión para comentar'}
              </span>
            </div>

            {/* Text Area */}
            <textarea
              rows={4}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={
                currentUser 
                  ? "Escribe tu respuesta aquí. Sé respetuoso si el hilo tiene la etiqueta [TEMA SERIO]..."
                  : "Haz clic en 'Conectar' o pulsa en Enviar para identificarte con Google o Email."
              }
              className="w-full bg-slate-50 border border-slate-300 rounded-md p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-y"
            />

            {/* Action Row */}
            <div className="flex items-center justify-between pt-1">
              <div className="text-xs text-slate-400">
                Formato de foros clásico activado
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !replyText.trim()}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm px-5 py-2 rounded shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Publicando...' : 'Publicar Respuesta'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
