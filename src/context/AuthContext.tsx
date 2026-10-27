import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase/config';
import { UserProfile } from '../types/forum';

const LOCAL_STORAGE_KEY = 'foro_persisted_user_profile';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  loginWithEmail: (e: string, p: string) => Promise<void>;
  registerWithEmail: (e: string, p: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  loginAsAdminDirect: () => void;
  openAuthModal: (mode?: 'login' | 'register' | 'info') => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'info';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'info'>('login');

  const openAuthModal = (mode: 'login' | 'register' | 'info' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const saveProfileLocally = (profile: UserProfile | null) => {
    setUserProfile(profile);
    if (profile) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  // Helper to load or initialize profile from Firestore
  const syncUserProfile = async (user: User) => {
    try {
      const profileRef = doc(db, 'user_profiles', user.uid);
      const docSnap = await getDoc(profileRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        saveProfileLocally(data);
      } else {
        const isAdmin = user.email?.toLowerCase() === 'ancor.primee@gmail.com';
        const newProfile: UserProfile = {
          id: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'Forero_' + user.uid.substring(0, 5),
          email: user.email || '',
          avatarUrl: user.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`,
          role: isAdmin ? 'admin' : 'user',
          customTitle: isAdmin ? 'Administrador Supremo' : 'Forero Novato',
          signature: '«Comentando en Foro Alterno»',
          messageCount: 1,
          likesReceived: 0,
          createdAt: new Date().toISOString(),
        };

        await setDoc(profileRef, newProfile).catch(() => {});
        saveProfileLocally(newProfile);
      }
    } catch (err) {
      console.warn('Error syncing profile from Firestore:', err);
      // Fallback local representation
      const isAdmin = user.email?.toLowerCase() === 'ancor.primee@gmail.com';
      const fallback: UserProfile = {
        id: user.uid,
        displayName: user.displayName || 'Forero',
        email: user.email || '',
        avatarUrl: user.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`,
        role: isAdmin ? 'admin' : 'user',
        customTitle: isAdmin ? 'Administrador Supremo' : 'Forero Alterno',
        messageCount: 1,
        likesReceived: 0,
        createdAt: new Date().toISOString(),
      };
      saveProfileLocally(fallback);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await syncUserProfile(user);
      } else {
        // Keep persisted local profile if logged in via direct admin
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          try {
            setUserProfile(JSON.parse(saved));
          } catch {
            setUserProfile(null);
          }
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        await syncUserProfile(res.user);
        setIsAuthModalOpen(false);
      }
    } catch (error) {
      console.error('Google Sign-in failed:', error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        await syncUserProfile(res.user);
        setIsAuthModalOpen(false);
      }
    } catch (error) {
      console.error('Email sign in failed:', error);
      throw error;
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        await updateProfile(res.user, { displayName: name });
        await syncUserProfile(res.user);
        setIsAuthModalOpen(false);
      }
    } catch (error) {
      console.error('Email registration failed:', error);
      throw error;
    }
  };

  const loginAsAdminDirect = async () => {
    const adminProfile: UserProfile = {
      id: 'admin_ancor_primee',
      displayName: 'Ancor Prime',
      email: 'ancor.primee@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'admin',
      customTitle: 'Administrador Supremo',
      signature: '«Controlando Foro Alterno con poderes de Administrador»',
      messageCount: 1337,
      likesReceived: 420,
      createdAt: '2024-01-01T00:00:00Z',
    };
    saveProfileLocally(adminProfile);

    // Also persist in Firestore if connected
    try {
      const ref = doc(db, 'user_profiles', adminProfile.id);
      await setDoc(ref, adminProfile, { merge: true });
    } catch {
      // Non-fatal
    }

    setIsAuthModalOpen(false);
  };

  const logout = async () => {
    try {
      saveProfileLocally(null);
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      saveProfileLocally(null);
    }
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!currentUser && !userProfile) return;
    const uid = currentUser?.uid || userProfile?.id;
    if (!uid) return;

    const updated = { ...userProfile, ...data } as UserProfile;
    saveProfileLocally(updated);

    try {
      const profileRef = doc(db, 'user_profiles', uid);
      await updateDoc(profileRef, data);
    } catch (error) {
      console.warn('Could not update profile in Firestore:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        signInWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        updateProfileData,
        loginAsAdminDirect,
        openAuthModal,
        closeAuthModal,
        isAuthModalOpen,
        authModalMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
