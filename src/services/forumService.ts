import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  increment, 
  onSnapshot, 
  deleteDoc
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase/config';
import { Thread, Reply, UserProfile, ThreadPrefix } from '../types/forum';

// Generate unique clean ID
export function generateId(prefix: string = 'doc'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

// Track threads already viewed in this browser session to prevent write-loops
const viewedThreadsSession = new Set<string>();

// 1. Subscribe to threads in Firestore (Clean, NO automatic seeding, NO write-loops)
export function subscribeThreads(
  categoryId: string | null,
  onUpdate: (threads: Thread[]) => void
): () => void {
  const threadsRef = collection(db, 'threads');
  
  const unsubscribe = onSnapshot(
    threadsRef,
    (snapshot) => {
      let list = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as Thread[];

      if (categoryId) {
        list = list.filter(t => t.categoryId === categoryId);
      }

      // Stable sorting: Pinned first, then by createdAt/updatedAt descending
      list.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        const timeB = new Date(b.lastReplyAt || b.createdAt || 0).getTime();
        const timeA = new Date(a.lastReplyAt || a.createdAt || 0).getTime();
        return timeB - timeA;
      });

      onUpdate(list);
    },
    (error) => {
      console.warn('Firestore threads snapshot error:', error.message);
      onUpdate([]);
    }
  );

  return unsubscribe;
}

// 2. Subscribe to a single thread
export function subscribeThread(
  threadId: string,
  onUpdate: (thread: Thread | null) => void
): () => void {
  const docRef = doc(db, 'threads', threadId);

  const unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate({ id: snapshot.id, ...snapshot.data() } as Thread);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      console.warn('Error fetching thread:', error.message);
      onUpdate(null);
    }
  );

  return unsubscribe;
}

// 3. Subscribe to replies of a thread (Strictly stable, sorted by postNumber)
export function subscribeReplies(
  threadId: string,
  onUpdate: (replies: Reply[]) => void
): () => void {
  const repliesRef = collection(db, 'replies');

  const unsubscribe = onSnapshot(
    repliesRef,
    (snapshot) => {
      const threadReplies = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() } as Reply))
        .filter(r => r.threadId === threadId)
        .sort((a, b) => {
          if (a.postNumber && b.postNumber) return a.postNumber - b.postNumber;
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        });

      onUpdate(threadReplies);
    },
    (error) => {
      console.warn('Replies listener error:', error.message);
      onUpdate([]);
    }
  );

  return unsubscribe;
}

// 4. Create new thread
export async function createThread(
  data: {
    title: string;
    categoryId: string;
    prefix?: ThreadPrefix;
    content: string;
    author: UserProfile;
  }
): Promise<string> {
  const threadId = generateId('th');
  const now = new Date().toISOString();

  const newThread: Thread = {
    id: threadId,
    title: data.title.trim(),
    categoryId: data.categoryId,
    prefix: data.prefix,
    content: data.content.trim(),
    authorId: data.author.id,
    authorName: data.author.displayName,
    authorAvatar: data.author.avatarUrl,
    authorRole: data.author.role,
    authorTitle: data.author.customTitle,
    replyCount: 0,
    viewCount: 1,
    likeCount: 0,
    lastReplyAt: now,
    lastReplyAuthorName: data.author.displayName,
    isPinned: false,
    isLocked: false,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const threadRef = doc(db, 'threads', threadId);
    await setDoc(threadRef, newThread);

    // Update author post count
    const profileRef = doc(db, 'user_profiles', data.author.id);
    await updateDoc(profileRef, {
      messageCount: increment(1),
    }).catch(() => {});

    return threadId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `threads/${threadId}`);
  }
}

// 5. Create a reply in a thread
export async function createReply(
  threadId: string,
  content: string,
  author: UserProfile,
  currentReplyCount: number,
  quote?: { authorName: string; content: string }
): Promise<string> {
  const replyId = generateId('rep');
  const now = new Date().toISOString();
  const nextPostNumber = currentReplyCount + 1;

  const newReply: Reply = {
    id: replyId,
    threadId,
    authorId: author.id,
    authorName: author.displayName,
    authorAvatar: author.avatarUrl,
    authorRole: author.role,
    authorTitle: author.customTitle,
    authorPostCount: (author.messageCount || 0) + 1,
    authorLikesReceived: author.likesReceived || 0,
    authorSignature: author.signature,
    content: content.trim(),
    postNumber: nextPostNumber,
    likeCount: 0,
    quoteAuthor: quote?.authorName,
    quoteContent: quote?.content,
    createdAt: now,
  };

  try {
    // 1. Save reply
    const replyRef = doc(db, 'replies', replyId);
    await setDoc(replyRef, newReply);

    // 2. Update thread reply counter and last reply info
    const threadRef = doc(db, 'threads', threadId);
    await updateDoc(threadRef, {
      replyCount: increment(1),
      lastReplyAt: now,
      lastReplyAuthorName: author.displayName,
    });

    // 3. Update author message count
    const profileRef = doc(db, 'user_profiles', author.id);
    await updateDoc(profileRef, {
      messageCount: increment(1),
    }).catch(() => {});

    return replyId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `replies/${replyId}`);
  }
}

// 6. Toggle like / mis dies (+1)
export async function toggleLike(
  targetType: 'thread' | 'reply',
  targetId: string,
  userId: string
): Promise<{ liked: boolean; newCount: number }> {
  const likeDocId = `${targetType}_${targetId}_${userId}`;
  const likeRef = doc(db, 'likes', likeDocId);

  try {
    const existingSnap = await getDoc(likeRef);
    const targetRef = doc(db, targetType === 'thread' ? 'threads' : 'replies', targetId);

    if (existingSnap.exists()) {
      await deleteDoc(likeRef);
      await updateDoc(targetRef, {
        likeCount: increment(-1),
      }).catch(() => {});
      return { liked: false, newCount: -1 };
    } else {
      await setDoc(likeRef, {
        id: likeDocId,
        targetType,
        targetId,
        userId,
        createdAt: new Date().toISOString(),
      });
      await updateDoc(targetRef, {
        likeCount: increment(1),
      }).catch(() => {});
      return { liked: true, newCount: 1 };
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `likes/${likeDocId}`);
  }
}

// 7. Increment view count (Guarded to ONLY execute once per session to avoid write-loops)
export async function incrementThreadViews(threadId: string) {
  if (viewedThreadsSession.has(threadId)) return;
  viewedThreadsSession.add(threadId);

  try {
    const threadRef = doc(db, 'threads', threadId);
    await updateDoc(threadRef, {
      viewCount: increment(1),
    });
  } catch (err) {
    // Non-fatal
  }
}

// AUTHORIZED ADMINS LIST
export const AUTHORIZED_ADMIN_EMAILS: readonly string[] = Object.freeze([
  'ancor.primee@gmail.com'
]);

export function verifyAdminAuthorization(userEmail?: string | null): boolean {
  if (!userEmail) return false;
  return AUTHORIZED_ADMIN_EMAILS.includes(userEmail.trim().toLowerCase());
}

// ADMIN ACTIONS (Strictly validated against AUTHORIZED_ADMIN_EMAILS before write)
export async function adminTogglePinThread(threadId: string, currentPinned: boolean, executorEmail?: string | null) {
  const emailToVerify = executorEmail || auth.currentUser?.email;
  if (!verifyAdminAuthorization(emailToVerify)) {
    throw new Error(`Permiso denegado: La cuenta "${emailToVerify || 'anónimo'}" no está en la lista de administradores autorizados.`);
  }

  try {
    const ref = doc(db, 'threads', threadId);
    await updateDoc(ref, {
      isPinned: !currentPinned,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `threads/${threadId}`);
  }
}

export async function adminToggleLockThread(threadId: string, currentLocked: boolean, executorEmail?: string | null) {
  const emailToVerify = executorEmail || auth.currentUser?.email;
  if (!verifyAdminAuthorization(emailToVerify)) {
    throw new Error(`Permiso denegado: La cuenta "${emailToVerify || 'anónimo'}" no está en la lista de administradores autorizados.`);
  }

  try {
    const ref = doc(db, 'threads', threadId);
    await updateDoc(ref, {
      isLocked: !currentLocked,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `threads/${threadId}`);
  }
}

export async function adminDeleteThread(threadId: string, executorEmail?: string | null) {
  const emailToVerify = executorEmail || auth.currentUser?.email;
  if (!verifyAdminAuthorization(emailToVerify)) {
    throw new Error(`Permiso denegado: La cuenta "${emailToVerify || 'anónimo'}" no está en la lista de administradores autorizados.`);
  }

  try {
    const ref = doc(db, 'threads', threadId);
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `threads/${threadId}`);
  }
}

export async function adminUpdateUserRole(userId: string, newRole: 'user' | 'moderator' | 'admin', customTitle?: string, executorEmail?: string | null) {
  const emailToVerify = executorEmail || auth.currentUser?.email;
  if (!verifyAdminAuthorization(emailToVerify)) {
    throw new Error(`Permiso denegado: La cuenta "${emailToVerify || 'anónimo'}" no está en la lista de administradores autorizados.`);
  }

  try {
    const ref = doc(db, 'user_profiles', userId);
    await updateDoc(ref, {
      role: newRole,
      ...(customTitle ? { customTitle } : {}),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `user_profiles/${userId}`);
  }
}
