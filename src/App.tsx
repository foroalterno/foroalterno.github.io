import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { SubNav } from './components/SubNav';
import { CategoryList } from './components/CategoryList';
import { ThreadList } from './components/ThreadList';
import { ThreadDetail } from './components/ThreadDetail';
import { Sidebar } from './components/Sidebar';
import { CreateThreadModal } from './components/CreateThreadModal';
import { ForoBotDrawer } from './components/ForoBotDrawer';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { RulesModal } from './components/RulesModal';
import { AdminPanel } from './components/AdminPanel';
import { 
  subscribeThreads, 
  subscribeThread, 
  subscribeReplies, 
  createThread, 
  createReply, 
  toggleLike, 
  incrementThreadViews 
} from './services/forumService';
import { Thread, Reply, Category, ForumStats, ThreadPrefix } from './types/forum';
import { CATEGORIES } from './data/categories';
import { INITIAL_STATS } from './data/seedData';
import { MessageSquare, Heart, Shield, Sparkles, ExternalLink, Crown } from 'lucide-react';

function ForumMain() {
  const { currentUser, userProfile, openAuthModal } = useAuth();

  // Navigation & View state
  const [activeTab, setActiveTab] = useState<'index' | 'recent' | 'popular'>('index');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Data state
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThread, setCurrentThread] = useState<Thread | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [stats, setStats] = useState<ForumStats>(INITIAL_STATS);
  const [likedThreadIds, setLikedThreadIds] = useState<Set<string>>(new Set());
  const [likedReplyIds, setLikedReplyIds] = useState<Set<string>>(new Set());

  // Global announcements
  const [announcementText, setAnnouncementText] = useState<string>(
    'Bienvenido a Foro Alterno. Respetad la etiqueta [TEMA SERIO] y ¡dad vuestros dies!'
  );

  // Modals state
  const [isCreateThreadOpen, setIsCreateThreadOpen] = useState(false);
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  const isAuthorizedAdmin = 
    currentUser?.email?.toLowerCase() === 'ancor.primee@gmail.com' ||
    userProfile?.email?.toLowerCase() === 'ancor.primee@gmail.com';

  // 1. Subscribe to threads list (Clean & Stable)
  useEffect(() => {
    const unsub = subscribeThreads(
      selectedCategory ? selectedCategory.id : null,
      (liveThreads) => {
        setThreads(liveThreads);
      }
    );

    return () => unsub();
  }, [selectedCategory]);

  // 2. Subscribe to selected thread & its replies
  useEffect(() => {
    if (!selectedThreadId) {
      setCurrentThread(null);
      setReplies([]);
      return;
    }

    incrementThreadViews(selectedThreadId);

    const unsubThread = subscribeThread(selectedThreadId, (threadData) => {
      setCurrentThread(threadData);
      if (threadData && !selectedCategory) {
        const foundCat = CATEGORIES.find(c => c.id === threadData.categoryId);
        if (foundCat) setSelectedCategory(foundCat);
      }
    });

    const unsubReplies = subscribeReplies(selectedThreadId, (liveReplies) => {
      setReplies(liveReplies);
    });

    return () => {
      unsubThread();
      unsubReplies();
    };
  }, [selectedThreadId]);

  // Handlers
  const handleSelectCategory = (cat: Category | null) => {
    setSelectedCategory(cat);
    setSelectedThreadId(null);
    setSearchQuery('');
  };

  const handleSelectThread = (threadId: string) => {
    setSelectedThreadId(threadId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateHome = () => {
    setSelectedCategory(null);
    setSelectedThreadId(null);
    setActiveTab('index');
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateThreadSubmit = async (data: {
    title: string;
    categoryId: string;
    prefix?: ThreadPrefix;
    content: string;
  }) => {
    if (!currentUser && !userProfile) {
      openAuthModal('login');
      return;
    }

    const author = userProfile || {
      id: currentUser?.uid || 'user_guest',
      displayName: currentUser?.displayName || 'Forero',
      role: 'user',
      customTitle: 'Forero Alterno',
      messageCount: 1,
      likesReceived: 0,
      createdAt: new Date().toISOString(),
    };

    const newId = await createThread({
      title: data.title,
      categoryId: data.categoryId,
      prefix: data.prefix,
      content: data.content,
      author,
    });

    if (newId) {
      const foundCat = CATEGORIES.find(c => c.id === data.categoryId);
      if (foundCat) setSelectedCategory(foundCat);
      setSelectedThreadId(newId);
    }
  };

  const handlePostReply = async (
    content: string, 
    quote?: { authorName: string; content: string }
  ) => {
    if (!selectedThreadId) return;
    if (!currentUser && !userProfile) {
      openAuthModal('login');
      return;
    }

    const author = userProfile || {
      id: currentUser?.uid || 'user_guest',
      displayName: currentUser?.displayName || 'Forero',
      role: 'user',
      customTitle: 'Forero Alterno',
      messageCount: 1,
      likesReceived: 0,
      createdAt: new Date().toISOString(),
    };

    await createReply(
      selectedThreadId,
      content,
      author,
      currentThread?.replyCount || replies.length,
      quote
    );
  };

  const handleLikeThread = async (threadId: string) => {
    if (!currentUser && !userProfile) {
      openAuthModal('login');
      return;
    }

    const uid = currentUser?.uid || userProfile?.id || 'guest_user';
    const result = await toggleLike('thread', threadId, uid);
    setLikedThreadIds(prev => {
      const next = new Set(prev);
      if (result.liked) next.add(threadId);
      else next.delete(threadId);
      return next;
    });

    setCurrentThread(prev => {
      if (!prev || prev.id !== threadId) return prev;
      return { ...prev, likeCount: Math.max(0, prev.likeCount + result.newCount) };
    });
  };

  const handleLikeReply = async (replyId: string) => {
    if (!currentUser && !userProfile) {
      openAuthModal('login');
      return;
    }

    const uid = currentUser?.uid || userProfile?.id || 'guest_user';
    const result = await toggleLike('reply', replyId, uid);
    setLikedReplyIds(prev => {
      const next = new Set(prev);
      if (result.liked) next.add(replyId);
      else next.delete(replyId);
      return next;
    });

    setReplies(prev => 
      prev.map(r => r.id === replyId ? { ...r, likeCount: Math.max(0, r.likeCount + result.newCount) } : r)
    );
  };

  // Filter threads for search or tabs
  let displayedThreads = threads;
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    displayedThreads = threads.filter(
      t => t.title.toLowerCase().includes(q) || t.content.toLowerCase().includes(q) || t.authorName.toLowerCase().includes(q)
    );
  } else if (activeTab === 'popular') {
    displayedThreads = [...threads].sort((a, b) => (b.replyCount || 0) - (a.replyCount || 0));
  } else if (activeTab === 'recent') {
    displayedThreads = [...threads].sort(
      (a, b) => new Date(b.lastReplyAt || b.createdAt).getTime() - new Date(a.lastReplyAt || a.createdAt).getTime()
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#eef2f7] text-[#2c3e50] font-sans antialiased">
      {/* 1. Main Forum Header */}
      <Header
        onSearch={(query) => setSearchQuery(query)}
        onOpenBot={() => setIsBotOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAdmin={() => setIsAdminPanelOpen(true)}
        onNavigateHome={handleNavigateHome}
        announcementText={announcementText}
        onCreateThreadClick={() => {
          if (!currentUser && !userProfile) {
            openAuthModal('login');
          } else {
            setIsCreateThreadOpen(true);
          }
        }}
      />

      {/* 2. SubNav with breadcrumbs & view tabs */}
      <SubNav
        currentCategory={selectedCategory}
        currentThreadTitle={currentThread?.title || null}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSelectedCategory(null);
          setSelectedThreadId(null);
        }}
        onNavigateHome={handleNavigateHome}
        onSelectCategory={handleSelectCategory}
        onOpenBot={() => setIsBotOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
      />

      {/* 3. Main Forum Container (Content + Sidebar) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Left Area: 8 cols on desktop */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* View A: Thread Detail View */}
            {selectedThreadId && currentThread ? (
              <ThreadDetail
                thread={currentThread}
                replies={replies}
                category={selectedCategory || undefined}
                onBackToCategory={() => setSelectedThreadId(null)}
                onPostReply={handlePostReply}
                onLikeThread={handleLikeThread}
                onLikeReply={handleLikeReply}
                likedThreadIds={likedThreadIds}
                likedReplyIds={likedReplyIds}
              />
            ) : selectedCategory || activeTab !== 'index' || searchQuery.trim() ? (
              /* View B: Thread List View (Inside Category, Search or Tab) */
              <ThreadList
                category={selectedCategory}
                threads={displayedThreads}
                currentFilterTitle={
                  searchQuery.trim() 
                    ? `Resultados para: "${searchQuery}"`
                    : activeTab === 'popular'
                      ? 'Hilos Más Populares'
                      : activeTab === 'recent'
                        ? 'Nuevos Mensajes'
                        : undefined
                }
                onSelectThread={handleSelectThread}
                onCreateThread={() => {
                  if (!currentUser && !userProfile) openAuthModal('login');
                  else setIsCreateThreadOpen(true);
                }}
                onBackToHome={handleNavigateHome}
              />
            ) : (
              /* View C: Forum Categories Index (Classic ForoParalelo layout) */
              <CategoryList
                threads={threads}
                onSelectCategory={handleSelectCategory}
                onSelectThread={handleSelectThread}
              />
            )}

          </div>

          {/* Right Area: 4 cols Sidebar */}
          <div className="lg:col-span-4 space-y-5">
            {/* Admin Quick Action in Sidebar: ONLY FOR ancor.primee@gmail.com */}
            {isAuthorizedAdmin && (
              <div className="bg-gradient-to-r from-red-900 to-rose-900 text-white rounded-lg p-3.5 border border-yellow-400/40 shadow-sm flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-300" />
                  <div>
                    <div className="font-extrabold text-xs text-yellow-200">Panel Admin Staff</div>
                    <div className="text-[10px] text-red-200">ancor.primee@gmail.com</div>
                  </div>
                </div>
                <button
                  onClick={() => setIsAdminPanelOpen(true)}
                  className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-extrabold text-xs px-3 py-1.5 rounded transition-colors cursor-pointer shadow"
                >
                  Acceder
                </button>
              </div>
            )}

            <Sidebar
              stats={stats}
              recentThreads={threads}
              onSelectThread={handleSelectThread}
              onOpenBot={() => setIsBotOpen(true)}
              onOpenRules={() => setIsRulesOpen(true)}
            />
          </div>

        </div>
      </main>

      {/* 4. Classic Forum Footer */}
      <footer className="bg-[#1b3552] text-slate-300 border-t-4 border-[#2563eb] mt-12 py-8 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div className="font-extrabold text-sm tracking-wide text-white">
              FORO<span className="text-blue-400">ALTERNO</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Comunidad de debate en español inspirada en la estética y secciones de ForoParalelo.
            </p>
            <p className="text-slate-500 text-[10px]">
              Desarrollado con React 19, Tailwind CSS, Cloud Firestore y Gemini 3.8 Flash.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-3 text-xs">
            {isAuthorizedAdmin && (
              <>
                <button 
                  onClick={() => setIsAdminPanelOpen(true)}
                  className="text-yellow-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer bg-red-950/60 px-2 py-1 rounded border border-red-700/60"
                >
                  <Crown className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Panel Admin (ancor.primee@gmail.com)</span>
                </button>
                <span>•</span>
              </>
            )}
            <button 
              onClick={() => setIsRulesOpen(true)}
              className="hover:text-blue-300 transition-colors cursor-pointer"
            >
              Normas del Foro
            </button>
            <span>•</span>
            <button 
              onClick={() => setIsBotOpen(true)}
              className="hover:text-blue-300 transition-colors flex items-center gap-1 cursor-pointer text-amber-300"
            >
              <Sparkles className="w-3.5 h-3.5" />
              ForoBot IA
            </button>
            <span>•</span>
            <button 
              onClick={() => openAuthModal('info')}
              className="hover:text-blue-300 transition-colors cursor-pointer"
            >
              Guía Firebase
            </button>
            <span>•</span>
            <a 
              href="https://www.foroparalelo.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Referencia ForoParalelo</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <CreateThreadModal
        isOpen={isCreateThreadOpen}
        onClose={() => setIsCreateThreadOpen(false)}
        defaultCategory={selectedCategory}
        onSubmit={handleCreateThreadSubmit}
      />

      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        threads={threads}
        announcementText={announcementText}
        onUpdateAnnouncement={(t) => setAnnouncementText(t)}
        onRefreshData={() => {
          setSelectedCategory(selectedCategory ? { ...selectedCategory } : null);
        }}
      />

      <ForoBotDrawer
        isOpen={isBotOpen}
        onClose={() => setIsBotOpen(false)}
      />

      <AuthModal />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ForumMain />
    </AuthProvider>
  );
}
