import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, logout } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  googleAccessToken: string | null;
  signInWithGoogle: () => Promise<{ user: User; accessToken: string | null }>;
  logout: () => Promise<void>;
  setGoogleAccessToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  googleAccessToken: null,
  signInWithGoogle: async () => { throw new Error('AuthContext not initialized'); },
  logout: async () => {},
  setGoogleAccessToken: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleAccessToken, setGoogleAccessTokenState] = useState<string | null>(() => {
    return localStorage.getItem('alchemist_google_oauth_token') || null;
  });

  const setGoogleAccessToken = (token: string | null) => {
    setGoogleAccessTokenState(token);
    if (token) {
      localStorage.setItem('alchemist_google_oauth_token', token);
    } else {
      localStorage.removeItem('alchemist_google_oauth_token');
    }
  };

  const handleSignIn = async () => {
    const res = await signInWithGoogle();
    if (res.accessToken) {
      setGoogleAccessToken(res.accessToken);
    }
    return res;
  };

  const handleLogout = async () => {
    await logout();
    setGoogleAccessToken(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        googleAccessToken,
        signInWithGoogle: handleSignIn,
        logout: handleLogout,
        setGoogleAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
