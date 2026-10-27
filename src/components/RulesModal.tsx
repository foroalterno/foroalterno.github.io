import React from 'react';
import { X, ShieldCheck, AlertTriangle, Flame, Heart, Sparkles } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-lg shadow-2xl border border-slate-300 overflow-hidden animate-fadeIn my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1b3552] to-[#254b73] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">Normas y Rangos de Foro Alterno</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs sm:text-sm text-slate-700 max-h-[75vh] overflow-y-auto">
          
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-900">1. La Regla de Oro: [TEMA SERIO]</h4>
              <p className="text-amber-800 text-xs mt-0.5 leading-relaxed">
                Los hilos marcados con el prefijo <strong>[TEMA SERIO]</strong> no admiten troleos, chistes fuera de lugar, memes ni desviaciones del tema. Cualquier comentario que no aporte de forma constructiva será moderado.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>2. Etiquetas y Prefijos</span>
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs">
              <li><strong>[TEMA SERIO]</strong>: Debate riguroso sin humor ni troleos.</li>
              <li><strong>[+HD] / [FOTOS]</strong>: Hilos con fotos y contenido multimedia de calidad.</li>
              <li><strong>[DEBATE]</strong>: Discusión abierta y argumentada de opiniones enfrentadas.</li>
              <li><strong>[DUDA]</strong>: Petición de ayuda técnica o consejo a la comunidad.</li>
              <li><strong>[BRICO]</strong>: Guías paso a paso de mecánica, electrónica o carpintería.</li>
              <li><strong>[OFICIAL]</strong>: Hilos de recopilación temática o anuncios del staff.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>3. Sistema de "Dar mis dies" (+1)</span>
            </h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              El botón de "Dar mis dies" sirve para agradecer a un forero un aporte de valor, una anécdota bien narrada o una solución técnica eficaz. Los dies recibidos aumentan la reputación de tu cuenta en el foro.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span>4. ForoBot Alterno (Inteligencia Artificial)</span>
            </h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Dispones de un forero virtual con IA (Gemini 3.8 Flash con Google Search) capaz de resumir hilos largos y aportar datos contrastados. Puedes invocarlo o chatear con él en cualquier momento desde la barra lateral.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900">5. Prohibiciones Estrictas</h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs">
              <li>Prohibido el spam, venta ilícita o publicidad no autorizada.</li>
              <li>Prohibido publicar datos personales de terceros (doxxing).</li>
              <li>Respeta las normas básicas de convivencia digital española.</li>
            </ul>
          </div>

          <div className="pt-3 border-t border-slate-200">
            <button
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded text-xs transition-colors cursor-pointer"
            >
              He leído y acepto las normas
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
