import React, { useState } from 'react';
import { 
  MessageSquare, 
  Search, 
  LogIn, 
  User as UserIcon, 
  LogOut, 
  Sparkles, 
  Shield, 
  Flame, 
  Menu, 
  X,
  Bell,
  Crown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onSearch: (query: string) => void;
  onOpenBot: () => void;
  onOpenRules: () => void;
  onOpenProfile: () => void;
  onOpenAdmin: () => void;
  onNavigateHome: () => void;
  onCreateThreadClick: () => void;
  announcementText?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onSearch,
  onOpenBot,
  onOpenRules,
  onOpenProfile,
  onOpenAdmin,
  onNavigateHome,
  onCreateThreadClick,
  announcementText = 'Bienvenido a Foro Alterno. Respetad la etiqueta [TEMA SERIO] y ¡dad vuestros dies!',
}) => {
  const { currentUser, userProfile, logout, openAuthModal } = useAuth();
  const [searchVal, setSearchVal] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchVal);
  };

  const isAdmin = currentUser?.email?.toLowerCase() === 'ancor.primee@gmail.com' || userProfile?.email?.toLowerCase() === 'ancor.primee@gmail.com';

  return (
    <header className="sticky top-0 z-40 bg-[#162a45] text-white shadow-md border-b-4 border-[#2563eb]">
      {/* Top micro announcement bar */}
      <div className="bg-[#0f1d30] px-4 py-1 text-xs text-slate-300 flex justify-between items-center border-b border-slate-700/60">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="bg-red-600 text-white font-bold px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">
            Aviso
          </span>
          <span className="truncate">{announcementText}</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400 shrink-0">
          {/* Admin button ONLY for ancor.primee@gmail.com */}
          {isAdmin && (
            <>
              <button 
                onClick={onOpenAdmin}
                className="hover:text-yellow-300 transition-colors flex items-center gap-1 text-yellow-400 font-bold cursor-pointer bg-red-950/60 border border-red-700/60 px-2 py-0.5 rounded"
                title="Abrir Panel de Administración"
              >
                <Shield className="w-3 h-3 text-yellow-400" />
                <span>Panel Admin</span>
              </button>
              <span>|</span>
            </>
          )}
          <button 
            onClick={onOpenRules}
            className="hover:text-blue-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Shield className="w-3 h-3 text-amber-400" />
            Normas
          </button>
          <span>|</span>
          <button 
            onClick={onOpenBot}
            className="hover:text-blue-300 transition-colors flex items-center gap-1 text-blue-300 font-medium cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse" />
            ForoBot IA
          </button>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div 
            onClick={onNavigateHome}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 rounded-lg flex items-center justify-center shadow-inner border border-blue-400/30 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl tracking-tight text-white drop-shadow-sm font-sans">
                  FORO<span className="text-blue-400">ALTERNO</span>
                </span>
                <span className="bg-blue-500/20 text-blue-300 border border-blue-400/40 text-[10px] font-semibold px-1.5 py-0.2 rounded uppercase">
                  v2.6
                </span>
              </div>
              <p className="text-[11px] text-slate-300 hidden sm:block tracking-wide">
                La comunidad de debate, motor, tecnología y actualidad
              </p>
            </div>
          </div>

          {/* Search bar */}
          <form 
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md mx-4 relative"
          >
            <input
              type="text"
              placeholder="Buscar hilos, usuarios o etiquetas..."
              value={searchVal}
              onChange={(e) => {
                setSearchVal(e.target.value);
                onSearch(e.target.value);
              }}
              className="w-full bg-[#1e385b] text-sm text-slate-100 placeholder-slate-400 pl-9 pr-4 py-2 rounded-md border border-slate-600/70 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-[#23426b] transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </form>

          {/* User actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Prominent Admin Panel Button: ONLY FOR ancor.primee@gmail.com */}
            {isAdmin && (
              <button
                onClick={onOpenAdmin}
                className="bg-gradient-to-r from-red-700 to-rose-700 hover:from-red-600 hover:to-rose-600 text-yellow-300 border border-yellow-400/50 font-extrabold text-xs sm:text-sm px-3 sm:px-3.5 py-2 rounded shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                title="Panel de control para ancor.primee@gmail.com"
              >
                <Crown className="w-4 h-4 text-yellow-300" />
                <span className="hidden sm:inline">Panel Admin</span>
                <span className="sm:hidden">Admin</span>
              </button>
            )}

            <button
              onClick={onCreateThreadClick}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm px-3 sm:px-4 py-2 rounded shadow flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>Nuevo Tema</span>
            </button>

            {currentUser || userProfile ? (
              <div className="flex items-center gap-2">
                {/* Profile pill */}
                <div 
                  onClick={onOpenProfile}
                  className="flex items-center gap-2 bg-[#203c62] hover:bg-[#284976] px-2.5 py-1.5 rounded-lg border border-slate-600/60 cursor-pointer transition-colors"
                  title="Configurar perfil"
                >
                  <img
                    src={userProfile?.avatarUrl || currentUser?.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=user`}
                    alt="Avatar"
                    className="w-7 h-7 rounded-full object-cover border border-blue-400"
                  />
                  <div className="hidden lg:block text-left">
                    <div className="text-xs font-bold text-white flex items-center gap-1">
                      {userProfile?.displayName || currentUser?.displayName || 'Forero'}
                      {isAdmin && (
                        <span className="bg-red-600 text-white text-[9px] px-1 py-0.2 rounded font-mono font-bold">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-blue-300">
                      {userProfile?.customTitle || (isAdmin ? 'Administrador Supremo' : 'Forero Alterno')}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => logout()}
                  title="Cerrar sesión"
                  className="p-2 text-slate-300 hover:text-red-400 hover:bg-[#203c62] rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-medium px-3 py-2 rounded shadow transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Conectar</span>
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="hidden sm:inline-flex bg-slate-700/80 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium px-3 py-2 rounded transition-colors cursor-pointer"
                >
                  Registro
                </button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white rounded"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search bar if open */}
        {mobileMenuOpen && (
          <div className="mt-3 pt-3 border-t border-slate-700/80 md:hidden flex flex-col gap-2">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Buscar en el foro..."
                value={searchVal}
                onChange={(e) => {
                  setSearchVal(e.target.value);
                  onSearch(e.target.value);
                }}
                className="w-full bg-[#1e385b] text-sm text-slate-100 placeholder-slate-400 pl-9 pr-4 py-2 rounded border border-slate-600"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </form>
            <div className="flex gap-2 text-xs pt-1">
              <button 
                onClick={() => { onOpenAdmin(); setMobileMenuOpen(false); }}
                className="flex-1 py-1.5 bg-red-700 text-center rounded text-yellow-300 font-bold"
              >
                Panel Admin
              </button>
              <button 
                onClick={() => { onOpenRules(); setMobileMenuOpen(false); }}
                className="flex-1 py-1.5 bg-[#203c62] text-center rounded text-slate-200"
              >
                Normas
              </button>
              <button 
                onClick={() => { onOpenBot(); setMobileMenuOpen(false); }}
                className="flex-1 py-1.5 bg-blue-700 text-center rounded text-white flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-yellow-300" />
                ForoBot IA
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
