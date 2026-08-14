import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
});

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// Request Google profile, email, and Gmail readonly access for workout imports
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');

export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId || '(default)');

export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string | null }> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken || null;
    if (accessToken) {
      localStorage.setItem('alchemist_google_oauth_token', accessToken);
    }
    return { user: result.user, accessToken };
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const logout = async () => {
  return signOut(auth);
};

export type { User };
