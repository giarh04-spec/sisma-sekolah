import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from 'firebase/auth';

// Sample fallback config if firebase-applet-config.json is not present
const firebaseConfig: any = {
  apiKey: "AIzaSyDummyKeyForGoogleAuthInPreviewMode",
  authDomain: "applet-school-system.firebaseapp.com",
  projectId: "applet-school-system",
  storageBucket: "applet-school-system.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // user exists but token cleared
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken || '');
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  // If API key is dummy or placeholder in preview mode, return mock user directly
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('Dummy') || firebaseConfig.apiKey.includes('AIzaSyDummy')) {
    const mockUser = {
      uid: 'demo_user_123',
      email: 'giar.hermawan4@guru.smp.belajar.id',
      displayName: 'Administrator Sekolah',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    } as unknown as User;
    cachedAccessToken = 'demo_workspace_token_active';
    return { user: mockUser, accessToken: 'demo_workspace_token_active' };
  }

  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken || null;

    if (accessToken) {
      cachedAccessToken = accessToken;
    }

    return { user: result.user, accessToken: accessToken || '' };
  } catch (error: any) {
    if (
      error?.code === 'auth/api-key-not-valid' || 
      error?.message?.includes('api-key-not-valid') ||
      error?.message?.includes('API key')
    ) {
      console.warn('Firebase API key is placeholder. Fallback to Google Workspace preview mode.');
      const mockUser = {
        uid: 'demo_user_123',
        email: 'giar.hermawan4@guru.smp.belajar.id',
        displayName: 'Administrator Sekolah',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      } as unknown as User;
      cachedAccessToken = 'demo_workspace_token_active';
      return { user: mockUser, accessToken: 'demo_workspace_token_active' };
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const googleSignOut = async () => {
  cachedAccessToken = null;
  await signOut(auth);
};

export const getAccessToken = () => cachedAccessToken;
export const setAccessToken = (token: string) => { cachedAccessToken = token; };
