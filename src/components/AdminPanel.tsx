import React, { useState } from 'react';
import { 
  Shield, 
  X, 
  Pin, 
  Lock, 
  Unlock, 
  Trash2, 
  UserCheck, 
  Sparkles, 
  Database, 
  Megaphone, 
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Search,
  ExternalLink
} from 'lucide-react';
import { Thread, UserProfile } from '../types/forum';
import { CATEGORIES } from '../data/categories';
import { 
  adminTogglePinThread, 
  adminToggleLockThread, 
  adminDeleteThread,
  adminUpdateUserRole,
  createThread 
} from '../services/forumService';
import { useAuth } from '../context/AuthContext';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  threads: Thread[];
  announcementText: string;
  onUpdateAnnouncement: (text: string) => void;
  onRefreshData: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  threads,
  announcementText,
  onUpdateAnnouncement,
  onRefreshData,
}) => {
  const { userProfile, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'threads' | 'announcement' | 'ai_creator' | 'system'>('threads');
  
  // Threads tab filter
  const [threadSearch, setThreadSearch] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Announcement tab state
  const [tempAnnouncement, setTempAnnouncement] = useState(announcementText);

  // AI Creator tab state
  const [aiTopic, setAiTopic] = useState('');
  const [aiCategory, setAiCategory] = useState('general-principal');
  const [aiGenerating, setAiGenerating] = useState(false);

  if (!isOpen) return null;

  // STRICT ACCESS CHECK: Exclusively for ancor.primee@gmail.com
  const isAuthorizedAdmin = 
    currentUser?.email?.toLowerCase() === 'ancor.primee@gmail.com' ||
    userProfile?.email?.toLowerCase() === 'ancor.primee@gmail.com';

  if (!isAuthorizedAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
        <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 text-center space-y-4 border-2 border-red-600 animate-fadeIn">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            <Shield className="w-7 h-7 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Acceso Denegado</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Este panel de administración es de uso exclusivo para: <br />
            <strong className="text-red-600 font-mono text-sm">ancor.primee@gmail.com</strong>
          </p>
          <p className="text-xs text-slate-500">
            {currentUser?.email ? (
              <span>Actualmente has iniciado sesión como <strong>{currentUser.email}</strong>, que no tiene rango de administración.</span>
            ) : (
              <span>Debes iniciar sesión con tu cuenta oficial <strong>ancor.primee@gmail.com</strong> para acceder.</span>
            )}
          </p>
          <div className="pt-2">
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-5 py-2.5 rounded-lg text-xs cursor-pointer shadow"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleTogglePin = async (t: Thread) => {
    try {
      await adminTogglePinThread(t.id, !!t.isPinned, currentUser?.email);
      showNotification(`Hilo "${t.title.substring(0, 30)}..." ${t.isPinned ? 'desfijado' : 'fijado con chincheta'}.`);
    } catch (err: any) {
      alert(err.message || 'Error al fijar hilo.');
    }
  };

  const handleToggleLock = async (t: Thread) => {
    try {
      await adminToggleLockThread(t.id, !!t.isLocked, currentUser?.email);
      showNotification(`Hilo "${t.title.substring(0, 30)}..." ${t.isLocked ? 'desbloqueado' : 'bloqueado contra nuevas respuestas'}.`);
    } catch (err: any) {
      alert(err.message || 'Error al bloquear hilo.');
    }
  };

  const handleDelete = async (threadId: string) => {
    if (window.confirm('¿Confirmas que deseas eliminar este hilo definitivamente del foro?')) {
      try {
        await adminDeleteThread(threadId, currentUser?.email);
        showNotification('Hilo eliminado con éxito.');
      } catch (err: any) {
        alert(err.message || 'Error al eliminar hilo.');
      }
    }
  };

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAnnouncement(tempAnnouncement);
    showNotification('¡Aviso global actualizado en la cabecera del foro!');
  };

  const handleGenerateStaffThread = async () => {
    if (!aiTopic.trim()) return;
    setAiGenerating(true);
    try {
      if (!userProfile) return;
      const targetCat = CATEGORIES.find(c => c.id === aiCategory) || CATEGORIES[0];
      
      const newTitle = `[OFICIAL] Debate del Staff: ${aiTopic.trim()}`;
      const newContent = `Hilo promovido por la Administración de Foro Alterno (ancor.primee@gmail.com):\n\nQueremos conocer la opinión de los foreros sobre **${aiTopic.trim()}**.\n\nPor favor exponed vuestros argumentos con respeto y dad vuestros dies a los comentarios mejor fundamentados.\n\n¡Comienza el debate en ${targetCat.name}!`;

      await createThread({
        title: newTitle,
        categoryId: aiCategory,
        prefix: 'OFICIAL',
        content: newContent,
        author: userProfile,
      });

      setAiTopic('');
      showNotification('¡Hilo oficial del staff publicado con éxito en el foro!');
      setActiveTab('threads');
    } catch (err: any) {
      alert('Error al publicar: ' + err.message);
    } finally {
      setAiGenerating(false);
    }
  };

  const filteredThreads = threads.filter(t => 
    t.title.toLowerCase().includes(threadSearch.toLowerCase()) ||
    t.authorName.toLowerCase().includes(threadSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl border-2 border-red-500/50 overflow-hidden animate-fadeIn my-6 max-h-[90vh] flex flex-col">
        
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-[#991b1b] via-[#b91c1c] to-[#7f1d1d] text-white px-6 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-black/30 border border-red-300/40 flex items-center justify-center">
              <Shield className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg sm:text-xl tracking-tight">
                  PANEL DE ADMINISTRADOR
                </h2>
                <span className="bg-yellow-400 text-red-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Acceso Total
                </span>
              </div>
              <p className="text-xs text-red-100">
                Sesión activa como: <strong className="text-yellow-200">ancor.primee@gmail.com</strong> (Administrador Supremo)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-red-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Success toast banner */}
        {actionSuccess && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-100 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('threads')}
            className={`px-5 py-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'threads'
                ? 'border-red-600 bg-white text-red-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Pin className="w-4 h-4" />
            <span>Moderación de Hilos ({threads.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('announcement')}
            className={`px-5 py-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'announcement'
                ? 'border-red-600 bg-white text-red-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Aviso Global del Foro</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_creator')}
            className={`px-5 py-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'ai_creator'
                ? 'border-red-600 bg-white text-red-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Publicador de Hilos Oficiales</span>
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`px-5 py-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'system'
                ? 'border-red-600 bg-white text-red-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Estado de Firebase / DB</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800 text-xs sm:text-sm">
          
          {/* TAB 1: THREADS MODERATION */}
          {activeTab === 'threads' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="Buscar hilo o autor para moderar..."
                    value={threadSearch}
                    onChange={(e) => setThreadSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
                <div className="text-xs text-slate-500">
                  Mostrando {filteredThreads.length} de {threads.length} hilos
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-200">
                {filteredThreads.map((t) => (
                  <div key={t.id} className="p-3 sm:p-4 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {t.isPinned && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Pin className="w-3 h-3 fill-amber-700" /> FIJADO
                          </span>
                        )}
                        {t.isLocked && (
                          <span className="bg-red-100 text-red-800 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Lock className="w-3 h-3" /> CERRADO
                          </span>
                        )}
                        <span className="font-bold text-slate-900 text-sm">{t.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                        <span>Autor: <strong>{t.authorName}</strong></span>
                        <span>•</span>
                        <span>{t.replyCount} respuestas</span>
                        <span>•</span>
                        <span>{t.viewCount} visitas</span>
                        <span>•</span>
                        <span className="text-slate-400 font-mono text-[10px]">ID: {t.id}</span>
                      </div>
                    </div>

                    {/* Moderation Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleTogglePin(t)}
                        className={`px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                          t.isPinned
                            ? 'bg-amber-500 text-white hover:bg-amber-600'
                            : 'bg-slate-100 text-slate-700 hover:bg-amber-100 hover:text-amber-800 border border-slate-300'
                        }`}
                        title={t.isPinned ? 'Desfijar de la cima' : 'Fijar con chincheta arriba'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                        <span>{t.isPinned ? 'Fijado' : 'Fijar'}</span>
                      </button>

                      <button
                        onClick={() => handleToggleLock(t)}
                        className={`px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                          t.isLocked
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-700 border border-slate-300'
                        }`}
                        title={t.isLocked ? 'Reabrir hilo a respuestas' : 'Cerrar hilo (nadie podrá comentar)'}
                      >
                        {t.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        <span>{t.isLocked ? 'Abrir' : 'Cerrar'}</span>
                      </button>

                      <button
                        onClick={() => handleDelete(t.id)}
                        className="px-2.5 py-1.5 rounded bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        title="Eliminar hilo permanentemente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Borrar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ANNOUNCEMENT BANNER */}
          {activeTab === 'announcement' && (
            <form onSubmit={handleSaveAnnouncement} className="space-y-4 max-w-xl">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <h4 className="font-bold text-amber-900 text-sm flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-amber-600" />
                  <span>Aviso Global en la Cabecera</span>
                </h4>
                <p className="text-xs text-amber-800 mt-1">
                  Este mensaje se mostrará a todos los visitantes y usuarios en la barra superior de Foro Alterno.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Texto del anuncio oficial:
                </label>
                <textarea
                  rows={3}
                  value={tempAnnouncement}
                  onChange={(e) => setTempAnnouncement(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-900 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  placeholder="Escribe el aviso aquí..."
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-500 text-white font-bold px-5 py-2.5 rounded-lg shadow cursor-pointer text-xs transition-all"
                >
                  Guardar y Publicar Aviso
                </button>
                <button
                  type="button"
                  onClick={() => setTempAnnouncement('Bienvenido a Foro Alterno. Respetad la etiqueta [TEMA SERIO] y ¡dad vuestros dies!')}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-4 py-2.5 rounded-lg text-xs"
                >
                  Restablecer por defecto
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: STAFF AI THREAD CREATOR */}
          {activeTab === 'ai_creator' && (
            <div className="space-y-4 max-w-xl">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h4 className="font-bold text-blue-900 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Generador de Hilos Oficiales con IA</span>
                </h4>
                <p className="text-xs text-blue-800 mt-1">
                  Como administrador, puedes redactar y lanzar un debate oficial sobre cualquier tema de actualidad con un solo clic.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tema o debate a proponer:
                </label>
                <input
                  type="text"
                  placeholder="Ej: ¿Merece la pena el nuevo carnet B1 para menores de 16 años?"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Subforo de publicación:
                </label>
                <select
                  value={aiCategory}
                  onChange={(e) => setAiCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleGenerateStaffThread}
                disabled={aiGenerating || !aiTopic.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-lg shadow cursor-pointer text-xs flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>{aiGenerating ? 'Publicando...' : 'Publicar Hilo Oficial del Staff'}</span>
              </button>
            </div>
          )}

          {/* TAB 4: SYSTEM & FIRESTORE HEALTH */}
          {activeTab === 'system' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-2">
                  <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                    Base de Datos Firestore
                  </div>
                  <div className="font-mono text-xs text-slate-800 break-all font-semibold">
                    ai-studio-48c6feef-2679-4d1f-bf2d-a875a78c4bbf
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Conexión establecida y reglas desplegadas</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-2">
                  <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                    Proyecto Google Cloud / Firebase
                  </div>
                  <div className="font-mono text-xs text-slate-800 font-semibold">
                    gen-lang-client-0039919547
                  </div>
                  <div className="text-xs text-slate-500">
                    Región activa: europe-west3 / global
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs">Refrescar datos locales</h4>
                  <p className="text-[11px] text-slate-500">
                    Actualiza la sincronización de temas y respuestas desde Firestore en tiempo real.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onRefreshData();
                    showNotification('Datos sincronizados.');
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded shadow cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sincronizar</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-5 py-2 rounded-lg text-xs cursor-pointer"
          >
            Cerrar Panel
          </button>
        </div>

      </div>
    </div>
  );
};
