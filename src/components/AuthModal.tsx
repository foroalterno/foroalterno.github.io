import React, { useState } from 'react';
import { X, LogIn, UserPlus, Info, CheckCircle2, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalMode, 
    signInWithGoogle, 
    loginWithEmail, 
    registerWithEmail,
    loginAsAdminSimulation,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'info'>(authModalMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync mode when modal opens
  React.useEffect(() => {
    setMode(authModalMode);
    setErrorMsg('');
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      await signInWithGoogle();
      closeAuthModal();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al conectar con Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else {
        if (!displayName.trim()) {
          setErrorMsg('Introduce un nombre de usuario o nick forero.');
          return;
        }
        await registerWithEmail(email, password, displayName.trim());
      }
      closeAuthModal();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de autenticación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-lg shadow-2xl border border-slate-300 overflow-hidden animate-fadeIn my-6">
        
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-[#1b3552] to-[#254b73] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-300" />
            <h3 className="font-bold text-base">Identificación en Foro Alterno</h3>
          </div>
          <button
            onClick={closeAuthModal}
            className="text-slate-300 hover:text-white p-1 rounded hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-200 text-xs font-semibold bg-slate-50">
          <button
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            className={`flex-1 py-3 text-center transition-colors cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-blue-600 border-b-2 border-blue-600 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => { setMode('register'); setErrorMsg(''); }}
            className={`flex-1 py-3 text-center transition-colors cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-blue-600 border-b-2 border-blue-600 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Registro Forero
          </button>
          <button
            onClick={() => setMode('info')}
            className={`px-3 py-3 text-center transition-colors cursor-pointer flex items-center justify-center gap-1 ${
              mode === 'info'
                ? 'bg-white text-blue-600 border-b-2 border-blue-600 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Guía de configuración de Firebase"
          >
            <Info className="w-3.5 h-3.5 text-blue-500" />
            <span>Guía Firebase</span>
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 text-xs sm:text-sm">
          {errorMsg && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === 'info' ? (
            /* Firebase Setup Instructions tab */
            <div className="space-y-3 text-xs text-slate-700">
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <h4 className="font-bold text-blue-900 text-sm mb-1">
                  🔥 Guía de Configuración de Firebase
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  Foro Alterno está configurado para conectarse a Cloud Firestore y Firebase Authentication.
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-semibold text-slate-800">1. Sustituir firebaseConfig:</div>
                <p className="text-slate-600">
                  El objeto con tus credenciales se encuentra en:
                </p>
                <code className="block bg-slate-100 p-2 rounded text-[11px] font-mono text-slate-800">
                  /firebase-applet-config.json
                </code>
                <p className="text-[11px] text-slate-500">
                  (O en <code className="font-mono">src/firebase/config.ts</code> si deseas incrustarlo directamente).
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-semibold text-slate-800">2. Activar Authentication en la consola:</div>
                <p className="text-slate-600 leading-relaxed">
                  Entra en <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-blue-600 underline">console.firebase.google.com</a>, ve a <strong>Build &gt; Authentication &gt; Sign-in method</strong> y activa:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li><strong>Google</strong> (Recomendado para inicio con un clic)</li>
                  <li><strong>Correo electrónico/contraseña</strong> (Email/Password)</li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="font-semibold text-slate-800">3. Activar Cloud Firestore:</div>
                <p className="text-slate-600 leading-relaxed">
                  Ve a <strong>Build &gt; Firestore Database</strong>, pulsa "Crear base de datos" en modo producción y aplica las reglas de seguridad provistas en <code className="font-mono">firestore.rules</code>.
                </p>
              </div>

              <button
                onClick={() => setMode('login')}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded text-xs transition-colors cursor-pointer"
              >
                Entendido, volver a Iniciar Sesión
              </button>
            </div>
          ) : (
            /* Login / Register Forms */
            <div className="space-y-4">
              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold py-2.5 px-4 rounded border border-slate-300 shadow-xs flex items-center justify-center gap-3 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continuar con Google</span>
              </button>

              <div className="flex items-center my-3 text-slate-400 text-xs">
                <hr className="flex-1 border-slate-200" />
                <span className="px-2">o con tu correo y contraseña</span>
                <hr className="flex-1 border-slate-200" />
              </div>

              {/* Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                {mode === 'register' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nick / Nombre de usuario:
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: ForeroMítico"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Correo electrónico:
                  </label>
                  <input
                    type="email"
                    placeholder="tu-correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Contraseña:
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded shadow-sm transition-colors cursor-pointer disabled:opacity-50 mt-2"
                >
                  {loading 
                    ? 'Procesando...' 
                    : mode === 'login' 
                      ? 'Entrar a Foro Alterno' 
                      : 'Completar Registro'}
                </button>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
