import React, { useState, useRef } from 'react';
import { X, User, Save, CheckCircle2, Shield, Heart, MessageSquare, Upload, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, updateProfileData } = useAuth();
  
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [customTitle, setCustomTitle] = useState(userProfile?.customTitle || 'Forero Alterno');
  const [signature, setSignature] = useState(userProfile?.signature || '«Participando en Foro Alterno»');
  const [avatarUrl, setAvatarUrl] = useState(userProfile?.avatarUrl || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setCustomTitle(userProfile.customTitle || 'Forero Alterno');
      setSignature(userProfile.signature || '«Participando en Foro Alterno»');
      setAvatarUrl(userProfile.avatarUrl || '');
    }
  }, [userProfile, isOpen]);

  if (!isOpen || !userProfile) return null;

  // Handle local image file upload (converts to base64 data URL)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen no debe superar los 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setAvatarUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateProfileData({
        displayName: displayName.trim() || userProfile.displayName,
        customTitle: customTitle.trim(),
        signature: signature.trim(),
        avatarUrl: avatarUrl.trim(),
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-2xl border border-slate-300 overflow-hidden animate-fadeIn my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1b3552] to-[#254b73] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-300" />
            <h3 className="font-bold text-base">Editar Perfil de Forero</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs sm:text-sm">
          {savedSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>¡Perfil y foto actualizados con éxito!</span>
            </div>
          )}

          {/* Stats Bar */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center justify-around text-center">
            <div>
              <div className="text-[11px] text-slate-500">Rango</div>
              <div className="font-bold text-slate-800 capitalize">{userProfile.role}</div>
            </div>
            <div className="border-r border-slate-200 h-8" />
            <div>
              <div className="text-[11px] text-slate-500">Mensajes</div>
              <div className="font-bold text-blue-600 font-mono">{userProfile.messageCount || 1}</div>
            </div>
            <div className="border-r border-slate-200 h-8" />
            <div>
              <div className="text-[11px] text-slate-500">Mis dies</div>
              <div className="font-bold text-emerald-600 font-mono">+{userProfile.likesReceived || 0}</div>
            </div>
          </div>

          {/* Display Name Edit */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nombre de usuario / Nick:
            </label>
            <input
              type="text"
              maxLength={40}
              placeholder="Tu nick en el foro..."
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
            />
          </div>

          {/* Avatar selector & Image Upload */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Foto de perfil / Avatar:
            </label>
            <div className="flex items-center gap-3 mb-2">
              <img
                src={avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${userProfile.id}`}
                alt="Avatar actual"
                className="w-16 h-16 rounded-full border-2 border-blue-400 object-cover shrink-0 shadow-xs"
              />
              <div className="flex-1 space-y-1.5">
                <input
                  type="text"
                  placeholder="Pega la URL de cualquier imagen (https://...)"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-slate-100 hover:bg-blue-50 text-blue-700 border border-slate-300 text-xs px-3 py-1.5 rounded flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Subir imagen desde mi equipo</span>
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="text-slate-400 hover:text-red-500 text-xs"
                    >
                      Quitar
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 mt-2">
              <span className="text-[11px] text-slate-400 shrink-0">Avatares recomendados:</span>
              {PRESET_AVATARS.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Preset ${i}`}
                  onClick={() => setAvatarUrl(url)}
                  className={`w-8 h-8 rounded-full object-cover cursor-pointer hover:scale-110 transition-transform border ${
                    avatarUrl === url ? 'ring-2 ring-blue-600' : 'border-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Custom Title */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Título personalizado bajo tu nick:
            </label>
            <input
              type="text"
              maxLength={50}
              placeholder="Ej: Piloto de Karting, Maestro del Silicio, Forero Veterano"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Signature */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Firma del foro (aparece al pie de tus mensajes):
            </label>
            <textarea
              rows={3}
              maxLength={200}
              placeholder="Ej: «El motor ruge y la pole siempre se respeta.»"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono"
            />
            <div className="text-[11px] text-slate-400 text-right mt-0.5">
              {signature.length}/200 caracteres
            </div>
          </div>

          {/* Footer */}
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
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded shadow flex items-center gap-2 text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Guardando...' : 'Guardar Perfil'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
