import React from 'react';
import { Home, ChevronRight, Sparkles, Flame, Clock, Users, Shield } from 'lucide-react';
import { Category } from '../types/forum';

interface SubNavProps {
  currentCategory: Category | null;
  currentThreadTitle: string | null;
  activeTab: 'index' | 'recent' | 'popular';
  onSelectTab: (tab: 'index' | 'recent' | 'popular') => void;
  onNavigateHome: () => void;
  onSelectCategory: (cat: Category | null) => void;
  onOpenBot: () => void;
  onOpenRules: () => void;
}

export const SubNav: React.FC<SubNavProps> = ({
  currentCategory,
  currentThreadTitle,
  activeTab,
  onSelectTab,
  onNavigateHome,
  onSelectCategory,
  onOpenBot,
  onOpenRules,
}) => {
  return (
    <div className="bg-[#23426b] border-b border-[#1b3557] text-white shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-2 text-xs">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center flex-wrap gap-1 text-slate-300">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1 hover:text-white font-medium transition-colors cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-blue-300" />
              <span>Foro Alterno</span>
            </button>

            {currentCategory && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <button
                  onClick={() => onSelectCategory(currentCategory)}
                  className={`hover:text-white font-medium transition-colors cursor-pointer ${
                    !currentThreadTitle ? 'text-white font-semibold' : ''
                  }`}
                >
                  {currentCategory.name}
                </button>
              </>
            )}

            {currentThreadTitle && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-white font-medium truncate max-w-[200px] sm:max-w-[320px]">
                  {currentThreadTitle}
                </span>
              </>
            )}
          </nav>

          {/* Forum Navigation Tabs */}
          <div className="flex items-center gap-1 self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
            <button
              onClick={() => {
                onNavigateHome();
                onSelectTab('index');
              }}
              className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'index' && !currentCategory && !currentThreadTitle
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-[#1e385b]'
              }`}
            >
              <span>Foros</span>
            </button>

            <button
              onClick={() => {
                onNavigateHome();
                onSelectTab('recent');
              }}
              className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'recent'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-[#1e385b]'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Nuevos Mensajes</span>
            </button>

            <button
              onClick={() => {
                onNavigateHome();
                onSelectTab('popular');
              }}
              className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'popular'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-[#1e385b]'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Hilos Populares</span>
            </button>

            <button
              onClick={onOpenBot}
              className="px-3 py-1.5 rounded text-amber-200 hover:text-white hover:bg-[#1e385b] font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-bounce" />
              <span>ForoBot IA</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
