import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, orderBy, query } from 'firebase/firestore';
import { auth, db, signInWithGoogle, logout } from '../lib/firebase';
import { Athlete, AthleteTest } from '../types';
import { saveAthleteTest as saveAthleteTestService, handleFirestoreError, OperationType } from '../lib/firestoreService';

interface AuthContextType {
  user: User | null;
  currentUID: string | null;
  setCurrentUID: React.Dispatch<React.SetStateAction<string | null>>;
  athleteProfile: Athlete | null;
  athleteTests: AthleteTest[];
  loading: boolean;
  googleAccessToken: string | null;
  signInWithGoogle: () => Promise<{ user: User; accessToken: string | null }>;
  logout: () => Promise<void>;
  setGoogleAccessToken: (token: string | null) => void;
  saveTest: (testId: string, testData: Partial<AthleteTest> & Record<string, any>) => Promise<void>;
  updateProfile: (data: Partial<Athlete>) => Promise<void>;
  refreshProfile: () => Promise<Athlete | null>;
  refreshTests: () => Promise<AthleteTest[]>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  currentUID: null,
  setCurrentUID: () => {},
  athleteProfile: null,
  athleteTests: [],
  loading: true,
  googleAccessToken: null,
  signInWithGoogle: async () => { throw new Error('AuthContext not initialized'); },
  logout: async () => {},
  setGoogleAccessToken: () => {},
  saveTest: async () => {},
  updateProfile: async () => {},
  refreshProfile: async () => null,
  refreshTests: async () => [],
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentUID, setCurrentUID] = useState<string | null>(null);
  const [athleteProfile, setAthleteProfile] = useState<Athlete | null>(null);
  const [athleteTests, setAthleteTests] = useState<AthleteTest[]>([]);
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
    setCurrentUID(null);
    setAthleteProfile(null);
    setAthleteTests([]);
    setGoogleAccessToken(null);
  };

  const fetchAthleteProfile = async (uid: string): Promise<Athlete | null> => {
    const path = `athletes/${uid}`;
    try {
      // ดึงประวัติตอน login
      const snap = await getDoc(doc(db, 'athletes', uid));
      if (snap.exists()) {
        const data = snap.data() as Athlete;
        setAthleteProfile(data);
        return data;
      }
      return null;
    } catch (err) {
      console.warn('Could not fetch athlete profile:', err);
      return null;
    }
  };

  const fetchAthleteTests = async (uid: string): Promise<AthleteTest[]> => {
    const path = `athletes/${uid}/tests`;
    try {
      const testsRef = collection(db, 'athletes', uid, 'tests');
      const q = query(testsRef, orderBy('testedAt', 'desc'));
      const snap = await getDocs(q);
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AthleteTest));
      setAthleteTests(items);
      return items;
    } catch (err) {
      console.warn('Could not fetch athlete tests:', err);
      return [];
    }
  };

  const saveTest = async (testId: string, testData: Partial<AthleteTest> & Record<string, any>) => {
    if (!user) {
      throw new Error('User must be logged in to save test result');
    }
    // บันทึกผลทดสอบ
    await setDoc(doc(db, 'athletes', user.uid, 'tests', testId), testData, { merge: true });
    await fetchAthleteTests(user.uid);
  };

  const updateProfile = async (data: Partial<Athlete>) => {
    if (!user) return;
    const path = `athletes/${user.uid}`;
    try {
      await setDoc(doc(db, 'athletes', user.uid), data, { merge: true });
      await fetchAthleteProfile(user.uid);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setCurrentUID(currentUser.uid); // ใช้ uid นี้เป็น key ทุกครั้ง

        // ดึงประวัติตอน login
        const profile = await fetchAthleteProfile(currentUser.uid);
        if (!profile) {
          // Initialize default profile document for new user
          const initialProfile: Athlete = {
            id: currentUser.uid,
            name: currentUser.displayName || 'Grand Alchemist Runner',
            title: 'Master Transmuter',
            level: 1,
            exp: 150,
            maxExp: 1000,
            staminaHp: 100,
            staminaMaxHp: 100,
            manaMp: 100,
            vo2Max: 54,
            vdot: 49.5,
            acwr: 1.08,
            acute7dKm: 48,
            chronic28dKm: 190,
            avgCadence: 178,
            maxHr: 190,
            restingHr: 50,
            primaryDistance: '10K',
            avatarIcon: 'flame',
            themeColor: '#38D9C4',
            pbs: [
              { distance: '5K', time: '19:58', vdotEst: 50 },
              { distance: '10K', time: '41:40', vdotEst: 49.5 },
            ],
          };
          try {
            await setDoc(doc(db, 'athletes', currentUser.uid), initialProfile);
            setAthleteProfile(initialProfile);
          } catch (e) {
            console.warn('Initial profile creation skipped/deferred:', e);
          }
        }
        await fetchAthleteTests(currentUser.uid);
      } else {
        setCurrentUID(null);
        setAthleteProfile(null);
        setAthleteTests([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUID,
        setCurrentUID,
        athleteProfile,
        athleteTests,
        loading,
        googleAccessToken,
        signInWithGoogle: handleSignIn,
        logout: handleLogout,
        setGoogleAccessToken,
        saveTest,
        updateProfile,
        refreshProfile: async () => (user ? fetchAthleteProfile(user.uid) : null),
        refreshTests: async () => (user ? fetchAthleteTests(user.uid) : []),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
