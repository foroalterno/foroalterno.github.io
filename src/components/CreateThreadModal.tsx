import React, { useState } from 'react';
import { X, Send, Bold, Italic, Quote, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { ThreadPrefix, Category } from '../types/forum';
import { useAuth } from '../context/AuthContext';

interface CreateThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: Category | null;
  onSubmit: (data: {
    title: string;
    categoryId: string;
    prefix?: ThreadPrefix;
    content: string;
  }) => Promise<void>;
}

const PREFIXES: ThreadPrefix[] = [
  'TEMA SERIO',
  '+HD',
  'DEBATE',
  'DUDA',
  'NOTICIA',
  'OFICIAL',
  'BRICO',
  '+18',
];

export const CreateThreadModal: React.FC<CreateThreadModalProps> = ({
  isOpen,
  onClose,
  defaultCategory,
  onSubmit,
}) => {
  const { currentUser, userProfile, openAuthModal } = useAuth();
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(defaultCategory?.id || 'general-principal');
  const [selectedPrefix, setSelectedPrefix] = useState<ThreadPrefix | undefined>('DEBATE');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      openAuthModal('login');
      return;
    }

    if (!title.trim() || title.length < 5) {
      setErrorMsg('El título debe tener al menos 5 caracteres.');
      return;
    }

    if (!content.trim() || content.length < 10) {
      setErrorMsg('El mensaje debe tener al menos 10 caracteres para aportar sustancia al debate.');
      return;
    }

    setErrorMsg('');
    try {
      setIsSubmitting(true);
      await onSubmit({
        title: title.trim(),
        categoryId,
        prefix: selectedPrefix,
        content: content.trim(),
      });
      // Reset form
      setTitle('');
      setContent('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al publicar el hilo. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const insertTag = (tag: string) => {
    if (tag === 'b') setContent(prev => prev + ' [b]texto[/b] ');
    if (tag === 'i') setContent(prev => prev + ' [i]texto[/i] ');
    if (tag === 'quote') setContent(prev => prev + ' [quote]cita[/quote] ');
    if (tag === 'spoiler') setContent(prev => prev + ' [spoiler]contenido[/spoiler] ');
  };

  const handleInsertImagePrompt = () => {
    const url = prompt('Introduce la URL de la imagen (ej: https://.../foto.jpg):');
    if (url && url.trim()) {
      setContent(prev => prev + `\n[img]${url.trim()}[/img]\n`);
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
        setContent(prev => prev + `\n[img]${reader.result}[/img]\n`);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl border border-slate-300 overflow-hidden animate-fadeIn my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1b3552] to-[#254b73] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base">Crear Nuevo Tema en Foro Alterno</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Category Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Subforo de destino:
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Prefixes selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Etiqueta / Prefijo del hilo:
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedPrefix(undefined)}
                className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                  !selectedPrefix
                    ? 'bg-slate-700 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Sin prefijo
              </button>
              {PREFIXES.map((prefix) => (
                <button
                  key={prefix}
                  type="button"
                  onClick={() => setSelectedPrefix(prefix)}
                  className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                    selectedPrefix === prefix
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  [{prefix}]
                </button>
              ))}
            </div>
          </div>

          {/* Title input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-slate-700">
                Título del hilo:
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {title.length}/150
              </span>
            </div>
            <input
              type="text"
              maxLength={150}
              placeholder="Ej: ¿Qué coche gasolina o híbrido comprar con 15.000€?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Content Textarea with Toolbar */}
          <div>
            <div className="flex items-center justify-between pb-1 text-slate-600 text-xs">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => insertTag('b')}
                  className="p-1 hover:bg-slate-100 rounded"
                  title="Negrita"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTag('i')}
                  className="p-1 hover:bg-slate-100 rounded"
                  title="Cursiva"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTag('quote')}
                  className="p-1 hover:bg-slate-100 rounded"
                  title="Cita"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTag('spoiler')}
                  className="px-1.5 py-0.5 text-[11px] font-mono hover:bg-slate-100 rounded"
                >
                  [spoiler]
                </button>
                <div className="h-3 w-px bg-slate-300 mx-1" />
                <button
                  type="button"
                  onClick={handleInsertImagePrompt}
                  className="p-1 hover:bg-slate-100 rounded flex items-center gap-1 text-slate-700 hover:text-blue-600"
                  title="Insertar imagen por enlace [img]URL[/img]"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span className="text-[10px] hidden sm:inline">URL Foto</span>
                </button>
                <label
                  className="p-1 hover:bg-slate-100 rounded flex items-center gap-1 text-slate-700 hover:text-blue-600 cursor-pointer"
                  title="Subir imagen desde tu ordenador"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLocalImageSelect}
                    className="hidden"
                  />
                  <span className="text-[10px] text-blue-600 font-medium hover:underline">+ Subir Imagen</span>
                </label>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {content.length} caracteres
              </span>
            </div>

            <textarea
              rows={8}
              placeholder="Escribe aquí el cuerpo del mensaje. Desarrolla el tema para que otros foreros puedan opinar, debatir o ayudarte..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded p-3 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2 rounded shadow flex items-center gap-2 text-xs sm:text-sm cursor-pointer disabled:opacity-50 active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Publicando...' : 'Publicar Tema'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
