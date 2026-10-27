import React from 'react';
import { 
  MessageSquare, 
  Flame, 
  Newspaper, 
  Eye, 
  Car, 
  Compass, 
  Cpu, 
  Smartphone, 
  Gamepad2, 
  Dumbbell, 
  Film, 
  Utensils, 
  ShoppingBag, 
  HelpCircle, 
  Shield, 
  ChevronDown, 
  Clock, 
  User as UserIcon,
  FolderOpen
} from 'lucide-react';
import { Category, CategoryGroup, Thread } from '../types/forum';
import { CATEGORY_GROUPS, CATEGORIES } from '../data/categories';

interface CategoryListProps {
  threads: Thread[];
  onSelectCategory: (category: Category) => void;
  onSelectThread: (threadId: string) => void;
}

// Icon mapper helper
const getCategoryIcon = (iconName: string, color?: string) => {
  const iconProps = { className: "w-5 h-5", style: { color: color || '#2563eb' } };
  switch (iconName) {
    case 'Flame': return <Flame {...iconProps} />;
    case 'Newspaper': return <Newspaper {...iconProps} />;
    case 'Eye': return <Eye {...iconProps} />;
    case 'Car': return <Car {...iconProps} />;
    case 'Compass': return <Compass {...iconProps} />;
    case 'Cpu': return <Cpu {...iconProps} />;
    case 'Smartphone': return <Smartphone {...iconProps} />;
    case 'Gamepad2': return <Gamepad2 {...iconProps} />;
    case 'Dumbbell': return <Dumbbell {...iconProps} />;
    case 'Film': return <Film {...iconProps} />;
    case 'Utensils': return <Utensils {...iconProps} />;
    case 'ShoppingBag': return <ShoppingBag {...iconProps} />;
    case 'HelpCircle': return <HelpCircle {...iconProps} />;
    case 'Shield': return <Shield {...iconProps} />;
    default: return <MessageSquare {...iconProps} />;
  }
};

export const CategoryList: React.FC<CategoryListProps> = ({
  threads,
  onSelectCategory,
  onSelectThread,
}) => {

  // Helper to count threads & posts per category
  const getCategoryStats = (categoryId: string) => {
    const categoryThreads = threads.filter(t => t.categoryId === categoryId);
    const threadCount = categoryThreads.length;
    const postCount = categoryThreads.reduce((acc, t) => acc + (t.replyCount || 0) + 1, 0);
    
    // Latest thread in this category
    const sorted = [...categoryThreads].sort((a, b) => 
      new Date(b.lastReplyAt || b.createdAt).getTime() - new Date(a.lastReplyAt || a.createdAt).getTime()
    );
    const latestThread = sorted[0] || null;

    return { threadCount, postCount, latestThread };
  };

  return (
    <div className="space-y-6">
      {CATEGORY_GROUPS.map((group) => {
        const groupCategories = CATEGORIES.filter(c => c.groupId === group.id);

        return (
          <div 
            key={group.id} 
            className="bg-white rounded-lg shadow-xs border border-slate-300 overflow-hidden"
          >
            {/* Category Group Header (Classic ForoParalelo dark blue gradient bar) */}
            <div className="bg-gradient-to-r from-[#1e3e62] to-[#28537d] text-white px-4 py-2.5 flex items-center justify-between border-b border-blue-900/40">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-blue-300" />
                <h2 className="font-bold text-sm sm:text-base tracking-wide uppercase font-sans">
                  {group.title}
                </h2>
                <span className="text-xs text-blue-200 hidden md:inline-block font-normal">
                  — {group.description}
                </span>
              </div>
              <span className="text-xs text-blue-200 font-mono">
                {groupCategories.length} foros
              </span>
            </div>

            {/* Subforums Table Header */}
            <div className="hidden md:grid grid-cols-12 bg-slate-100 text-slate-500 font-semibold text-[11px] uppercase tracking-wider py-1.5 px-4 border-b border-slate-200">
              <div className="col-span-7">Foro</div>
              <div className="col-span-2 text-center">Temas / Mensajes</div>
              <div className="col-span-3 text-right">Último Mensaje</div>
            </div>

            {/* Category Rows */}
            <div className="divide-y divide-slate-200">
              {groupCategories.map((category) => {
                const { threadCount, postCount, latestThread } = getCategoryStats(category.id);

                return (
                  <div
                    key={category.id}
                    className="grid grid-cols-1 md:grid-cols-12 p-3 sm:p-4 hover:bg-blue-50/50 transition-colors items-center gap-3 md:gap-0"
                  >
                    {/* Left: Icon & Info */}
                    <div className="col-span-1 md:col-span-7 flex items-start gap-3 sm:gap-4">
                      {/* Icon Container */}
                      <div 
                        onClick={() => onSelectCategory(category)}
                        className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-300/80 flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 transition-transform shadow-xs"
                      >
                        {getCategoryIcon(category.icon, category.color)}
                      </div>

                      {/* Title & Description */}
                      <div className="flex-1 min-w-0">
                        <h3 
                          onClick={() => onSelectCategory(category)}
                          className="font-bold text-slate-800 text-sm sm:text-base hover:text-blue-600 transition-colors cursor-pointer truncate"
                        >
                          {category.name}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                          {category.description}
                        </p>

                        {/* Subforums tags */}
                        {category.subforums && category.subforums.length > 0 && (
                          <div className="flex items-center flex-wrap gap-1.5 mt-2 text-[11px]">
                            <span className="text-slate-400 font-medium">Subforos:</span>
                            {category.subforums.map((sub, i) => (
                              <span
                                key={i}
                                onClick={() => onSelectCategory(category)}
                                className="bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 px-1.5 py-0.5 rounded border border-slate-200 cursor-pointer transition-colors"
                              >
                                {sub}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Middle: Counters (Temas / Mensajes) */}
                    <div className="hidden md:flex col-span-2 flex-col items-center justify-center text-center">
                      <div className="text-xs font-bold text-slate-700">
                        {threadCount.toLocaleString()} <span className="font-normal text-slate-400 text-[10px]">temas</span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        {postCount.toLocaleString()} <span className="text-slate-400 text-[10px]">posts</span>
                      </div>
                    </div>

                    {/* Right: Last Post Preview */}
                    <div className="col-span-1 md:col-span-3 text-left md:text-right text-xs">
                      {latestThread ? (
                        <div className="space-y-0.5">
                          <button
                            onClick={() => onSelectThread(latestThread.id)}
                            className="font-semibold text-slate-700 hover:text-blue-600 truncate block w-full text-left md:text-right cursor-pointer"
                            title={latestThread.title}
                          >
                            {latestThread.prefix && (
                              <span className="text-blue-600 mr-1 font-bold">
                                [{latestThread.prefix}]
                              </span>
                            )}
                            {latestThread.title}
                          </button>
                          <div className="text-[11px] text-slate-500 flex items-center md:justify-end gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{latestThread.lastReplyAt || 'Reciente'}</span>
                            <span className="text-slate-400">por</span>
                            <span className="font-semibold text-slate-600 truncate max-w-[90px]">
                              {latestThread.lastReplyAuthorName || latestThread.authorName}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">
                          Sin mensajes aún
                        </span>
                      )}
                    </div>

                    {/* Mobile Stats pill */}
                    <div className="flex md:hidden items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <span>{threadCount} temas • {postCount} respuestas</span>
                      <button 
                        onClick={() => onSelectCategory(category)}
                        className="text-blue-600 font-bold hover:underline"
                      >
                        Entrar al foro &rarr;
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        );
      })}
    </div>
  );
};
