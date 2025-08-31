import { db } from './firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  updateDoc, 
  arrayUnion,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';

// Generate 4-character session code
export const generateSessionCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Create a new classroom session
export const createSession = async (teacherName, gameMode, timeLimit) => {
  const code = generateSessionCode();
  const sessionData = {
    code,
    teacherName,
    gameMode, // 'timed', 'advanced', or 'training'
    timeLimit,
    createdAt: serverTimestamp(),
    isActive: true,
    students: [],
    startedAt: null,
    endedAt: null
  };
  
  try {
    await setDoc(doc(db, 'sessions', code), sessionData);
    return { success: true, code };
  } catch (error) {
    console.error('Error creating session:', error);
    return { success: false, error: error.message };
  }
};

// Join a classroom session as student
export const joinSession = async (code, studentName) => {
  try {
    const sessionRef = doc(db, 'sessions', code);
    const sessionSnap = await getDoc(sessionRef);
    
    if (!sessionSnap.exists()) {
      return { success: false, error: 'Session not found' };
    }
    
    const sessionData = sessionSnap.data();
    if (!sessionData.isActive) {
      return { success: false, error: 'Session is no longer active' };
    }
    
    // Check if student already joined
    const existingStudent = sessionData.students.find(s => s.name === studentName);
    if (existingStudent) {
      return { success: false, error: 'A student with that name already joined' };
    }
    
    // Add student to session
    const studentData = {
      name: studentName,
      score: { correct: 0, total: 0 },
      joinedAt: new Date(),
      isReady: false,
      currentStreak: 0,
      bestStreak: 0
    };
    
    await updateDoc(sessionRef, {
      students: arrayUnion(studentData)
    });
    
    return { success: true, session: sessionData };
  } catch (error) {
    console.error('Error joining session:', error);
    return { success: false, error: error.message };
  }
};

// Remove student from session (for cleanup when backing out)
export const leaveSession = async (code, studentName) => {
  try {
    const sessionRef = doc(db, 'sessions', code);
    const sessionSnap = await getDoc(sessionRef);
    
    if (!sessionSnap.exists()) {
      return { success: false, error: 'Session not found' };
    }
    
    const sessionData = sessionSnap.data();
    const updatedStudents = sessionData.students.filter(s => s.name !== studentName);
    
    await updateDoc(sessionRef, {
      students: updatedStudents
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error leaving session:', error);
    return { success: false, error: error.message };
  }
};

// Update student score in session
export const updateStudentScore = async (code, studentName, newScore, streak = 0) => {
  try {
    const sessionRef = doc(db, 'sessions', code);
    const sessionSnap = await getDoc(sessionRef);
    
    if (!sessionSnap.exists()) return false;
    
    const sessionData = sessionSnap.data();
    const updatedStudents = sessionData.students.map(student => {
      if (student.name === studentName) {
        return {
          ...student,
          score: newScore,
          currentStreak: streak,
          bestStreak: Math.max(student.bestStreak || 0, streak)
        };
      }
      return student;
    });
    
    await updateDoc(sessionRef, { students: updatedStudents });
    return true;
  } catch (error) {
    console.error('Error updating score:', error);
    return false;
  }
};

// Start the game session (teacher only)
export const startSession = async (code) => {
  try {
    const sessionRef = doc(db, 'sessions', code);
    await updateDoc(sessionRef, {
      startedAt: serverTimestamp(),
      isActive: true
    });
    return true;
  } catch (error) {
    console.error('Error starting session:', error);
    return false;
  }
};

// End the game session (teacher only)
export const endSession = async (code) => {
  try {
    const sessionRef = doc(db, 'sessions', code);
    await updateDoc(sessionRef, {
      endedAt: serverTimestamp(),
      isActive: false
    });
    return true;
  } catch (error) {
    console.error('Error ending session:', error);
    return false;
  }
};

// Listen to session changes (real-time updates)
export const subscribeToSession = (code, callback) => {
  const sessionRef = doc(db, 'sessions', code);
  return onSnapshot(sessionRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error listening to session:', error);
    callback(null);
  });
};

// Delete session (cleanup)
export const deleteSession = async (code) => {
  try {
    await deleteDoc(doc(db, 'sessions', code));
    return true;
  } catch (error) {
    console.error('Error deleting session:', error);
    return false;
  }
};