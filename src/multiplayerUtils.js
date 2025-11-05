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

// =================== SQUAD BATTLE FUNCTIONS ===================

// Generate 3-character squad code
export const generateSquadCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 3; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Create a new squad battle
export const createSquadBattle = async (hostName, battleType) => {
  const code = generateSquadCode();
  const squadData = {
    code,
    hostName,
    battleType, // 'quickClash', 'epicDuel', 'survival'
    createdAt: serverTimestamp(),
    isActive: false,
    isStarted: false,
    players: [{
      name: hostName,
      score: 0,
      isReady: false,
      isHost: true,
      joinedAt: new Date().toISOString(),
      isEliminated: false, // for survival mode
      currentStreak: 0,
      bestStreak: 0
    }],
    startedAt: null,
    endedAt: null,
    readyPlayers: []
  };

  try {
    await setDoc(doc(db, 'squadBattles', code), squadData);
    return { success: true, code };
  } catch (error) {
    console.error('Error creating squad battle:', error);
    return { success: false, error: error.message };
  }
};

// Join a squad battle
export const joinSquadBattle = async (code, playerName) => {
  try {
    const squadRef = doc(db, 'squadBattles', code);
    const squadSnap = await getDoc(squadRef);

    if (!squadSnap.exists()) {
      return { success: false, error: 'Squad battle not found' };
    }

    const squadData = squadSnap.data();

    if (squadData.isStarted) {
      return { success: false, error: 'Battle already in progress' };
    }

    if (squadData.players.length >= 6) {
      return { success: false, error: 'Squad is full (max 6 players)' };
    }

    const existingPlayer = squadData.players.find(p => p.name === playerName);
    if (existingPlayer) {
      return { success: false, error: 'A player with that name already joined' };
    }

    const newPlayer = {
      name: playerName,
      score: 0,
      isReady: false,
      isHost: false,
      joinedAt: new Date().toISOString(),
      isEliminated: false,
      currentStreak: 0,
      bestStreak: 0
    };

    await updateDoc(squadRef, {
      players: arrayUnion(newPlayer)
    });

    return { success: true };
  } catch (error) {
    console.error('Error joining squad:', error);
    return { success: false, error: error.message };
  }
};

// Leave squad battle
export const leaveSquadBattle = async (code, playerName) => {
  try {
    const squadRef = doc(db, 'squadBattles', code);
    const squadSnap = await getDoc(squadRef);

    if (!squadSnap.exists()) return false;

    const squadData = squadSnap.data();
    const updatedPlayers = squadData.players.filter(p => p.name !== playerName);

    // If host leaves and there are other players, make oldest player the new host
    if (squadData.hostName === playerName && updatedPlayers.length > 0) {
      updatedPlayers[0].isHost = true;
      await updateDoc(squadRef, {
        players: updatedPlayers,
        hostName: updatedPlayers[0].name
      });
    } else {
      await updateDoc(squadRef, { players: updatedPlayers });
    }

    // Delete squad if empty
    if (updatedPlayers.length === 0) {
      await deleteDoc(squadRef);
    }

    return true;
  } catch (error) {
    console.error('Error leaving squad:', error);
    return false;
  }
};

// Update player ready status
export const updatePlayerReady = async (code, playerName, isReady) => {
  try {
    const squadRef = doc(db, 'squadBattles', code);
    const squadSnap = await getDoc(squadRef);

    if (!squadSnap.exists()) return false;

    const squadData = squadSnap.data();
    const updatedPlayers = squadData.players.map(player => {
      if (player.name === playerName) {
        return { ...player, isReady };
      }
      return player;
    });

    const readyPlayers = updatedPlayers.filter(p => p.isReady).map(p => p.name);

    await updateDoc(squadRef, {
      players: updatedPlayers,
      readyPlayers
    });

    return true;
  } catch (error) {
    console.error('Error updating ready status:', error);
    return false;
  }
};

// Start squad battle (host only)
export const startSquadBattle = async (code) => {
  try {
    const squadRef = doc(db, 'squadBattles', code);
    await updateDoc(squadRef, {
      isStarted: true,
      isActive: true,
      startedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error starting squad battle:', error);
    return false;
  }
};

// Update player score in squad battle
export const updateSquadPlayerScore = async (code, playerName, newScore, streak = 0) => {
  try {
    const squadRef = doc(db, 'squadBattles', code);
    const squadSnap = await getDoc(squadRef);

    if (!squadSnap.exists()) return false;

    const squadData = squadSnap.data();
    const updatedPlayers = squadData.players.map(player => {
      if (player.name === playerName) {
        return {
          ...player,
          score: newScore,
          currentStreak: streak,
          bestStreak: Math.max(player.bestStreak || 0, streak)
        };
      }
      return player;
    });

    await updateDoc(squadRef, { players: updatedPlayers });
    return true;
  } catch (error) {
    console.error('Error updating squad score:', error);
    return false;
  }
};

// Eliminate player in survival mode
export const eliminatePlayer = async (code, playerName) => {
  try {
    const squadRef = doc(db, 'squadBattles', code);
    const squadSnap = await getDoc(squadRef);

    if (!squadSnap.exists()) return false;

    const squadData = squadSnap.data();
    const updatedPlayers = squadData.players.map(player => {
      if (player.name === playerName) {
        return { ...player, isEliminated: true };
      }
      return player;
    });

    await updateDoc(squadRef, { players: updatedPlayers });
    return true;
  } catch (error) {
    console.error('Error eliminating player:', error);
    return false;
  }
};

// Listen to squad battle updates
export const listenToSquadBattle = (code, callback) => {
  return onSnapshot(doc(db, 'squadBattles', code), (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error listening to squad battle:', error);
    callback(null);
  });
};

// Delete squad battle (cleanup)
export const deleteSquadBattle = async (code) => {
  try {
    await deleteDoc(doc(db, 'squadBattles', code));
    return true;
  } catch (error) {
    console.error('Error deleting squad battle:', error);
    return false;
  }
};