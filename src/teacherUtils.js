import { auth, db } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDocs,
  addDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

// Format a Date as a local YYYY-MM-DD calendar-day key
const formatDayKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// =================== TEACHER ACCOUNTS ===================

// Create a new teacher account (Firebase Auth + teachers/{uid} doc)
export const signUpTeacher = async (email, password, displayName) => {
  try {
    const trimmedName = displayName.trim();
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: trimmedName });
    await setDoc(doc(db, 'teachers', credential.user.uid), {
      displayName: trimmedName,
      email,
      createdAt: serverTimestamp()
    });
    return { success: true, uid: credential.user.uid };
  } catch (error) {
    console.error('Error signing up teacher:', error);
    return { success: false, error: error.message };
  }
};

// Log in an existing teacher
export const logInTeacher = async (email, password) => {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, uid: credential.user.uid };
  } catch (error) {
    console.error('Error logging in teacher:', error);
    return { success: false, error: error.message };
  }
};

// Log out the current teacher
export const logOutTeacher = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error('Error logging out teacher:', error);
    return false;
  }
};

// Listen to auth state changes (returns unsubscribe function)
export const subscribeToAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Listen to the list of registered teachers (for the student "select your teacher" dropdown)
export const subscribeToTeachers = (callback) => {
  return onSnapshot(collection(db, 'teachers'), (snapshot) => {
    const teachers = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
    callback(teachers);
  }, (error) => {
    console.error('Error listening to teachers:', error);
    callback([]);
  });
};

// =================== USAGE EVENTS ===================

// Log a completed (or best-effort-flushed) play attempt
export const logUsageEvent = async ({ teacherId, studentName, gameMode, score, startedAt, endedAt, durationSeconds, flushReason }) => {
  try {
    await addDoc(collection(db, 'usageEvents'), {
      teacherId: teacherId || null,
      studentName,
      gameMode,
      score: score || { correct: 0, total: 0 },
      startedAt: Timestamp.fromDate(new Date(startedAt)),
      endedAt: Timestamp.fromDate(new Date(endedAt)),
      durationSeconds,
      dayKey: formatDayKey(new Date(endedAt)),
      flushReason: flushReason || 'completed'
    });
    return true;
  } catch (error) {
    console.error('Error logging usage event:', error);
    return false;
  }
};

// Fetch all usage events for a teacher since a given date (for the dashboard)
export const fetchUsageEventsForTeacher = async (teacherId, sinceDate) => {
  try {
    const q = query(
      collection(db, 'usageEvents'),
      where('teacherId', '==', teacherId),
      where('startedAt', '>=', Timestamp.fromDate(sinceDate))
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
  } catch (error) {
    console.error('Error fetching usage events:', error);
    return [];
  }
};
