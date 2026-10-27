export type ThreadPrefix = 
  | 'TEMA SERIO' 
  | '+HD' 
  | 'OFICIAL' 
  | 'DEBATE' 
  | 'DUDA' 
  | 'NOTICIA' 
  | '+18' 
  | 'BRICO';

export interface Category {
  id: string;
  name: string;
  description: string;
  groupId: 'general' | 'motor' | 'tecnologia' | 'ocio' | 'comunidad';
  icon: string;
  subforums?: string[];
  threadCount?: number;
  postCount?: number;
  color?: string;
}

export interface CategoryGroup {
  id: 'general' | 'motor' | 'tecnologia' | 'ocio' | 'comunidad';
  title: string;
  description: string;
  icon: string;
}

export interface Thread {
  id: string;
  title: string;
  categoryId: string;
  prefix?: ThreadPrefix;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole?: string;
  authorTitle?: string;
  replyCount: number;
  viewCount: number;
  likeCount: number;
  lastReplyAt: string;
  lastReplyAuthorName?: string;
  isPinned?: boolean;
  isLocked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Reply {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole?: string;
  authorTitle?: string;
  authorPostCount?: number;
  authorLikesReceived?: number;
  authorJoinedDate?: string;
  authorSignature?: string;
  content: string;
  postNumber: number;
  likeCount: number;
  quoteAuthor?: string;
  quoteContent?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  role: 'user' | 'moderator' | 'admin';
  customTitle?: string;
  signature?: string;
  messageCount: number;
  likesReceived: number;
  createdAt: string;
}

export interface ForumStats {
  totalThreads: number;
  totalPosts: number;
  totalMembers: number;
  activeOnline: number;
  newestMember: string;
}

export interface GroundingSource {
  title: string;
  url: string;
}
