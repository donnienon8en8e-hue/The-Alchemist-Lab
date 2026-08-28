import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Athlete, AthleteTest, LoggedWorkout } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * 1. บันทึกผลทดสอบ (Save Athlete Test Result)
 * Example: await setDoc(doc(db, "athletes", user.uid, "tests", testId), testData);
 */
export async function saveAthleteTest(
  userId: string,
  testId: string,
  testData: Partial<AthleteTest> & Record<string, any>
): Promise<void> {
  const path = `athletes/${userId}/tests/${testId}`;
  try {
    const payload = {
      ...testData,
      id: testId,
      updatedAt: serverTimestamp(),
      createdAt: testData.createdAt || new Date().toISOString(),
    };
    await setDoc(doc(db, 'athletes', userId, 'tests', testId), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * 2. ดึงประวัติตอน login (Get Athlete Profile on Login)
 * Example: const snap = await getDoc(doc(db, "athletes", user.uid));
 */
export async function getAthleteProfile(userId: string): Promise<Athlete | null> {
  const path = `athletes/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'athletes', userId));
    if (snap.exists()) {
      return snap.data() as Athlete;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * บันทึกหรืออัปเดตข้อมูล Athlete Profile
 */
export async function saveAthleteProfile(
  userId: string,
  athleteData: Partial<Athlete>
): Promise<void> {
  const path = `athletes/${userId}`;
  try {
    await setDoc(
      doc(db, 'athletes', userId),
      {
        ...athleteData,
        id: userId,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * ดึงรายการผลการทดสอบทั้งหมดของนักกีฬา (Get All Tests for Athlete)
 */
export async function getAthleteTests(userId: string): Promise<AthleteTest[]> {
  const path = `athletes/${userId}/tests`;
  try {
    const testsRef = collection(db, 'athletes', userId, 'tests');
    const q = query(testsRef, orderBy('testedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AthleteTest));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Realtime Listener สำหรับ Athlete Profile
 */
export function subscribeAthleteProfile(
  userId: string,
  onUpdate: (athlete: Athlete | null) => void
): () => void {
  const path = `athletes/${userId}`;
  return onSnapshot(
    doc(db, 'athletes', userId),
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as Athlete);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Realtime Listener สำหรับรายการผลทดสอบ tests
 */
export function subscribeAthleteTests(
  userId: string,
  onUpdate: (tests: AthleteTest[]) => void
): () => void {
  const path = `athletes/${userId}/tests`;
  const testsRef = collection(db, 'athletes', userId, 'tests');
  return onSnapshot(
    testsRef,
    (snap) => {
      const tests = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AthleteTest));
      onUpdate(tests);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}
