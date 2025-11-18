import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import {
  createSession,
  joinSession,
  leaveSession,
  updateStudentScore,
  startSession,
  subscribeToSession,
  createSquadBattle,
  joinSquadBattle,
  leaveSquadBattle,
  updatePlayerReady,
  startSquadBattle,
  updateSquadPlayerScore,
  eliminatePlayer,
  listenToSquadBattle
} from './multiplayerUtils';

// Map URL paths to game modes
const pathToMode = {
  '/': 'nameInput',
  '/menu': 'menu',
  '/training': 'unlimited',
  '/timed': 'timed',
  '/advanced': 'advanced',
  '/detective': 'detective',
  '/two-digit': 'twoDigit',
  '/multiplayer': 'multiplayerSelect',
  '/multiplayer/create': 'createSession',
  '/multiplayer/join': 'joinSession',
  '/multiplayer/lobby/teacher': 'teacherLobby',
  '/multiplayer/lobby/student': 'studentLobby',
  '/multiplayer/monitor': 'teacherMonitor',
  '/multiplayer/results': 'multiplayerResults',
  '/squad': 'squadSelect',
  '/squad/create': 'createSquadBattle',
  '/squad/join': 'joinSquadBattle',
  '/squad/lobby': 'squadLobby',
  '/squad/battle': 'squadBattle',
  '/squad/survival': 'squadSurvival',
  '/squad/results': 'squadResults',
  '/results': 'results',
  '/changelog': 'changelog'
};

const modeToPath = {
  'nameInput': '/',
  'menu': '/menu',
  'unlimited': '/training',
  'timed': '/timed',
  'advanced': '/advanced',
  'detective': '/detective',
  'twoDigit': '/two-digit',
  'multiplayerSelect': '/multiplayer',
  'createSession': '/multiplayer/create',
  'joinSession': '/multiplayer/join',
  'teacherLobby': '/multiplayer/lobby/teacher',
  'studentLobby': '/multiplayer/lobby/student',
  'teacherMonitor': '/multiplayer/monitor',
  'multiplayerResults': '/multiplayer/results',
  'squadSelect': '/squad',
  'createSquadBattle': '/squad/create',
  'joinSquadBattle': '/squad/join',
  'squadLobby': '/squad/lobby',
  'squadBattle': '/squad/battle',
  'squadSurvival': '/squad/survival',
  'squadResults': '/squad/results',
  'results': '/results',
  'changelog': '/changelog'
};

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const [gameMode, setGameModeInternal] = useState(pathToMode[location.pathname] || 'nameInput');
  const [userName, setUserName] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState({ a: 0, b: 0 });

  // Custom setGameMode that also updates the URL
  const setGameMode = useCallback((mode) => {
    setGameModeInternal(mode);
    const path = modeToPath[mode] || '/';
    if (location.pathname !== path) {
      navigate(path);
    }
  }, [navigate, location.pathname]);

  // Sync gameMode with URL changes (browser back/forward)
  useEffect(() => {
    const mode = pathToMode[location.pathname];
    if (mode && mode !== gameMode) {
      setGameModeInternal(mode);
    }
  }, [location.pathname, gameMode]);

  // App version and changelog
  const APP_VERSION = 'v3.3.0';
  const CHANGELOG = [
    {
      version: 'v3.3.0',
      date: '11-18-2025',
      features: [
        'URL-based routing for all game modes and screens',
        'Browser back/forward navigation support',
        'Direct URL access to specific game modes',
        'Improved web-based navigation and bookmarking',
        'React Router integration with 20+ routes'
      ]
    },
    {
      version: 'v3.2.0',
      date: '11-17-2025',
      features: [
        'New Two-Digit Multiplication Mode: 10-question practice with step-by-step working',
        'Traditional vertical multiplication layout with proper digit alignment',
        'Carry digit inputs for multiplication (above problem) and addition (above partial products)',
        'Detailed feedback showing which rows are incorrect (first partial product, second partial product, or sum)',
        'Student choice after wrong answers: "Try Again" to correct work or "Next Question" to continue',
        'Crypto-secure random generation for two-digit numbers (10-99)',
        'Auto-advance after correct answers, manual control after incorrect answers'
      ]
    },
    {
      version: 'v3.0.1',
      date: '11-04-2025',
      features: [
        'Enhanced Detective Mode randomization with crypto-secure random generation',
        'Expanded factor range to 0-12 (previously 1-12) for zero property education',
        'Dynamic product generation with 169 possible combinations (up from 11)',
        'Special zero multiplication logic: 0 × any number = 0 accepts all valid answers',
        'Manual dismiss for wrong answers - users control when to advance',
        'Improved feedback display with "Next Question" button for learning review',
        'Fixed input validation to properly support zero as a factor'
      ]
    },
    {
      version: 'v3.0.0',
      date: '09-30-2025',
      features: [
        'Monster Squad Showdown: Student-led peer battles',
        'Quick Clash: 3-minute speed battle mode with real-time leaderboards',
        'Survival Mode: Last player standing elimination game',
        'Color-coded battle themes (Blue for Quick Clash, Red for Survival)',
        'Countdown audio warnings for last 5 seconds',
        'Battle end sound effects and improved Firebase security'
      ]
    },
    {
      version: 'v2.1.2',
      date: '09-28-2025',
      features: [
        'Smart name validation requiring first and last name',
        '10 funny validation messages to encourage real names',
        'In-app error display with shake animation (no more browser alerts)',
        'Visual guidelines and examples for proper name entry',
        'Improved classroom management through student identification'
      ]
    },
    {
      version: 'v2.1.1',
      date: '09-05-2025',
      features: [
        'Version history and changelog screen',
        'Unified card border radius (10px) and increased border width',
        'Improved feedback message text contrast (white text)',
        'Consistent height alignment for input fields and buttons',
        'Added copyright footer with automatic year increment'
      ]
    },
    {
      version: 'v2.1.0',
      date: '09-04-2025',
      features: [
        'Monster Detective mode with 5 clue types',
        'Division preparation variant with prefilled inputs',
        'Compact card-based home screen design',
        'Design system implementation with Hanken Grotesk font',
        'Enhanced favicon and social sharing support'
      ]
    },
    {
      version: 'v2.0.0',
      date: '08-31-2025',
      features: [
        'Firebase multiplayer classroom battle mode',
        'Real-time teacher monitoring and leaderboards',
        'Countdown timer system for session synchronization',
        'Advanced audio system with multiple sound variations',
        'Teacher guide integration for classroom usage'
      ]
    }
  ];
  const [userAnswer, setUserAnswer] = useState('');
  
  // Monster Detective mode states
  const [detectiveClue, setDetectiveClue] = useState({ type: '', clue: '', acceptedAnswers: [], prefilledFactor: null, prefilledPosition: null });
  const [detectiveInput, setDetectiveInput] = useState({ factor1: '', factor2: '' });
  const [detectiveQuestionCount, setDetectiveQuestionCount] = useState(0);
  const detectiveMaxQuestions = 10;

  // Two-Digit mode states
  const [twoDigitQuestionCount, setTwoDigitQuestionCount] = useState(0);
  const twoDigitMaxQuestions = 10;
  const [twoDigitWork, setTwoDigitWork] = useState({
    carry1: '', carry2: '', // Carry digits above tens and hundreds places for multiplication
    addCarry1: '', addCarry2: '', addCarry3: '', // Carry digits for addition (tens, hundreds, thousands)
    row1: { ones: '', tens: '', hundreds: '', thousands: '' }, // First partial product
    row2: { ones: '0', tens: '', hundreds: '', thousands: '' }, // Second partial product (ones place is always 0)
    sum: { ones: '', tens: '', hundreds: '', thousands: '' } // Final sum
  });
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameActive, setGameActive] = useState(false);
  const [feedback, setFeedback] = useState({ show: false, correct: false, message: '', correctAnswer: 0 });
  const [scoreHistory, setScoreHistory] = useState({ timed: [], advanced: [] });
  const [previousGameMode, setPreviousGameMode] = useState('unlimited');
  const [usedQuestions, setUsedQuestions] = useState(new Set());

  // Multiplayer states
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [userRole, setUserRole] = useState(''); // 'teacher' or 'student'
  const [sessionCode, setSessionCode] = useState('');
  const [sessionData, setSessionData] = useState(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [sessionUnsubscribe, setSessionUnsubscribe] = useState(null);
  const [selectedGameMode, setSelectedGameMode] = useState('timed');
  const [isCreating, setIsCreating] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(null);
  const questionTimeoutRef = useRef(null);

  // Squad Battle states
  const [isSquadBattle, setIsSquadBattle] = useState(false);
  const [squadCode, setSquadCode] = useState('');
  const [squadData, setSquadData] = useState(null);
  const [squadBattleType, setSquadBattleType] = useState('quickClash'); // 'quickClash', 'epicDuel', 'survival'
  const [isSquadHost, setIsSquadHost] = useState(false);
  const [squadUnsubscribe, setSquadUnsubscribe] = useState(null);
  const [playersReady, setPlayersReady] = useState(new Set());
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [squadInputCode, setSquadInputCode] = useState('');
  const [isJoiningSquad, setIsJoiningSquad] = useState(false);
  const [isCreatingSquad, setIsCreatingSquad] = useState(false);

  // Survival mode specific states
  const [playerLives, setPlayerLives] = useState(3); // Each player starts with 3 lives
  const [isEliminated, setIsEliminated] = useState(false);

  // Audio initialization state for Safari
  const [audioInitialized, setAudioInitialized] = useState(false);

  // Name validation state
  const [nameError, setNameError] = useState('');

  // Countdown states
  const [countdown, setCountdown] = useState(null);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [hasStartedSession, setHasStartedSession] = useState(false);

  // Error message states
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  // Confirmation dialog states
  const [confirmMessage, setConfirmMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // Show error message function
  const showErrorMessage = (message) => {
    setErrorMessage(message);
    setShowError(true);
    // Auto-hide error after 5 seconds
    setTimeout(() => {
      setShowError(false);
    }, 5000);
  };

  // Hide error message function
  const hideErrorMessage = () => {
    setShowError(false);
  };

  // Show confirmation dialog function
  const showConfirmDialog = (message, onConfirm) => {
    setConfirmMessage(message);
    setConfirmAction(() => onConfirm);
    setShowConfirm(true);
  };

  // Hide confirmation dialog function
  const hideConfirmDialog = () => {
    setShowConfirm(false);
    setConfirmAction(null);
  };

  // Handle confirmation dialog confirm
  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    hideConfirmDialog();
  };

  // Ref for answer input field to enable auto-focus
  const answerInputRef = useRef(null);

  // Complete multiplayer cleanup helper
  const cleanupMultiplayerState = async () => {
    // Remove student from Firebase session if they joined one
    if (isMultiplayer && userRole === 'student' && sessionCode && userName) {
      console.log('🧹 Removing student from Firebase session:', sessionCode, userName);
      try {
        await leaveSession(sessionCode, userName);
      } catch (error) {
        console.error('Failed to leave session:', error);
      }
    }
    
    // Unsubscribe from session updates if in multiplayer
    if (sessionUnsubscribe) {
      sessionUnsubscribe();
      setSessionUnsubscribe(null);
    }
    
    // Reset all multiplayer state
    console.log('🧹 Cleaning up multiplayer state - setting isMultiplayer to false');
    console.trace('Cleanup call stack');
    setIsMultiplayer(false);
    setUserRole('');
    setSessionCode('');
    setSessionData(null);
    setCurrentStreak(0);
    setSelectedGameMode('timed');
    setIsCreating(false);
    setInputCode('');
    setIsJoining(false);
    setGameStartTime(null);
    setHasStartedSession(false);
    
    // Clear error messages and dialogs
    setShowError(false);
    setErrorMessage('');
    setShowConfirm(false);
    setConfirmMessage('');
    setConfirmAction(null);
  };

  // Initialize audio context on first user interaction (Safari requirement)
  const initializeAudio = async () => {
    if (!audioInitialized) {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        setAudioInitialized(true);
      } catch (error) {
        console.log('Audio initialization failed:', error);
      }
    }
  };

  // Google Analytics tracking helper
  const trackEvent = (action, category = 'Game', label = '', value = '') => {
    if (window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      });
    }
  };

  const playSound = async (type) => {
    // Disable gameplay sounds for teachers in multiplayer mode, but allow UI clicks
    if (isMultiplayer && userRole === 'teacher' && (type === 'submit' || type === 'correct' || type === 'incorrect')) {
      return;
    }
    
    // Ensure audio is initialized before playing sounds
    await initializeAudio();
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Resume audio context if it's suspended (Safari requirement)
      if (audioContext.state === 'suspended') {
        try {
          await audioContext.resume();
        } catch (resumeError) {
          console.log('Could not resume audio context:', resumeError);
          return; // Fail silently if audio can't be resumed
        }
      }
      
      if (type === 'submit') {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
      } else if (type === 'correct') {
        const correctSounds = [
          () => {
            const notes = [523.25, 659.25, 783.99];
            notes.forEach((freq, index) => {
              const oscillator = audioContext.createOscillator();
              const gainNode = audioContext.createGain();
              
              oscillator.connect(gainNode);
              gainNode.connect(audioContext.destination);
              
              oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
              oscillator.type = 'sine';
              
              gainNode.gain.setValueAtTime(0.15, audioContext.currentTime + index * 0.1);
              gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.1 + 0.2);
              
              oscillator.start(audioContext.currentTime + index * 0.1);
              oscillator.stop(audioContext.currentTime + index * 0.1 + 0.2);
            });
          },
          () => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.3);
            oscillator.type = 'triangle';
            
            gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
          },
          () => {
            [587.33, 698.46, 783.99, 880].forEach((freq, index) => {
              const oscillator = audioContext.createOscillator();
              const gainNode = audioContext.createGain();
              
              oscillator.connect(gainNode);
              gainNode.connect(audioContext.destination);
              
              oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
              oscillator.type = 'sine';
              
              gainNode.gain.setValueAtTime(0.1, audioContext.currentTime + index * 0.08);
              gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.08 + 0.15);
              
              oscillator.start(audioContext.currentTime + index * 0.08);
              oscillator.stop(audioContext.currentTime + index * 0.08 + 0.15);
            });
          }
        ];
        
        const randomSound = correctSounds[Math.floor(Math.random() * correctSounds.length)];
        randomSound();
      } else if (type === 'incorrect') {
        const incorrectSounds = [
          () => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);
            oscillator.type = 'sawtooth';
            
            gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
          },
          () => {
            [262, 233, 208].forEach((freq, index) => {
              const oscillator = audioContext.createOscillator();
              const gainNode = audioContext.createGain();
              
              oscillator.connect(gainNode);
              gainNode.connect(audioContext.destination);
              
              oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
              oscillator.type = 'triangle';
              
              gainNode.gain.setValueAtTime(0.08, audioContext.currentTime + index * 0.12);
              gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.12 + 0.2);
              
              oscillator.start(audioContext.currentTime + index * 0.12);
              oscillator.stop(audioContext.currentTime + index * 0.12 + 0.2);
            });
          },
          () => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(0.06, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.06, audioContext.currentTime + 0.15);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.4);
          }
        ];
        
        const randomSound = incorrectSounds[Math.floor(Math.random() * incorrectSounds.length)];
        randomSound();
      } else if (type === 'click') {
        const clickSounds = [
          () => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.08);
            oscillator.type = 'triangle';
            
            gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.08);
          },
          () => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.06, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.06);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.06);
          },
          () => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(700, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(900, audioContext.currentTime + 0.05);
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(0.04, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.05);
          }
        ];
        
        const randomSound = clickSounds[Math.floor(Math.random() * clickSounds.length)];
        randomSound();
      } else if (type === 'countdown') {
        // Deep countdown beep
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      } else if (type === 'countdownFinal') {
        // Higher pitched final countdown beep
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      }
    } catch (error) {
      console.log('Audio not supported or blocked');
    }
  };

  // Countdown function
  const startCountdown = (callback) => {
    console.log('🔥 COUNTDOWN TRIGGERED! hasStartedSession:', hasStartedSession, 'gameActive:', gameActive, 'isMultiplayer:', isMultiplayer);
    console.trace('Countdown call stack');
    setIsCountingDown(true);
    setCountdown(3);
    
    let count = 3;
    const countdownInterval = setInterval(() => {
      if (count === 1) {
        playSound('countdownFinal');
      } else {
        playSound('countdown');
      }
      
      count--;
      
      if (count === 0) {
        clearInterval(countdownInterval);
        setIsCountingDown(false);
        setCountdown(null);
        callback(); // Execute the actual game start function
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  // Spooky background music system
  const [backgroundMusic, setBackgroundMusic] = useState(null);

  // End music playback function
  const playEndMusic = async () => {
    try {
      // Initialize audio on user interaction
      await initializeAudio();
      
      const audio = new Audio();
      audio.src = process.env.PUBLIC_URL + '/end.mp3';
      audio.volume = 0.4; // Slightly louder than background music
      
      // Play the end music
      try {
        await audio.play();
        console.log('🎵 Playing end music');
      } catch (playError) {
        console.log('End music playback failed:', playError);
      }
    } catch (error) {
      console.log('End music loading failed:', error);
    }
  };

  const createSpookyMusic = () => {
    try {
      // Try to load custom audio file first, fallback to procedural music
      const audio = new Audio();
      
      // Try custom audio file in public folder
      // Background music file
      audio.src = process.env.PUBLIC_URL + '/paperboy.mp3';
      audio.loop = true;
      audio.volume = 0.3;
      
      // Test if the audio file loads successfully
      return new Promise((resolve) => {
        audio.addEventListener('canplaythrough', () => {
          resolve({
            audio,
            isCustom: true,
            play: async () => {
              try {
                await audio.play();
              } catch (error) {
                console.log('Audio autoplay blocked, will play on user interaction');
              }
            },
            stop: () => {
              audio.pause();
              audio.currentTime = 0;
            }
          });
        });
        
        audio.addEventListener('error', () => {
          console.log('Custom audio file not found, using procedural music');
          resolve(createProceduralMusic());
        });
        
        // Trigger loading
        audio.load();
      });
      
    } catch (error) {
      console.log('Audio loading failed, using procedural music');
      return createProceduralMusic();
    }
  };

  const createProceduralMusic = async () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Resume audio context if it's suspended (Safari requirement)
      if (audioContext.state === 'suspended') {
        try {
          await audioContext.resume();
        } catch (error) {
          console.log('Cannot resume audio context, will try on user interaction');
        }
      }
      
      // Create a spooky ambient track with multiple oscillators
      const baseFreq = 80; // Low bass drone
      const melodyFreqs = [261.63, 293.66, 311.13, 349.23]; // Spooky minor scale notes
      
      const masterGain = audioContext.createGain();
      masterGain.gain.setValueAtTime(0.15, audioContext.currentTime);
      masterGain.connect(audioContext.destination);

      // Bass drone
      const bassOsc = audioContext.createOscillator();
      const bassGain = audioContext.createGain();
      bassOsc.frequency.setValueAtTime(baseFreq, audioContext.currentTime);
      bassOsc.type = 'sawtooth';
      bassGain.gain.setValueAtTime(0.3, audioContext.currentTime);
      bassOsc.connect(bassGain);
      bassGain.connect(masterGain);

      // Spooky melody that changes notes every 4 seconds
      const melodyOsc = audioContext.createOscillator();
      const melodyGain = audioContext.createGain();
      melodyOsc.type = 'triangle';
      melodyGain.gain.setValueAtTime(0.2, audioContext.currentTime);
      melodyOsc.connect(melodyGain);
      melodyGain.connect(masterGain);

      // Start oscillators
      bassOsc.start();
      melodyOsc.start();

      // Create melody pattern
      let currentTime = audioContext.currentTime;
      for (let i = 0; i < 30; i++) { // 2 minutes of pattern
        const noteIndex = i % melodyFreqs.length;
        melodyOsc.frequency.setValueAtTime(melodyFreqs[noteIndex], currentTime + i * 4);
      }

      // Store references for cleanup
      return {
        audioContext,
        oscillators: [bassOsc, melodyOsc],
        masterGain,
        isCustom: false
      };
    } catch (error) {
      console.log('Background music not supported or blocked');
      return null;
    }
  };

  const startBackgroundMusic = async () => {
    // Disable background music for all multiplayer mode (classroom usage)
    if (isMultiplayer) {
      return;
    }
    
    // Stop any existing music first
    if (backgroundMusic) {
      stopBackgroundMusic();
    }
    
    const music = await createSpookyMusic();
    if (music) {
      setBackgroundMusic(music);
      if (music.isCustom) {
        music.play();
      }
    }
  };

  const stopBackgroundMusic = useCallback(() => {
    if (backgroundMusic) {
      try {
        if (backgroundMusic.isCustom) {
          // Handle custom audio file
          backgroundMusic.stop();
        } else {
          // Handle procedural music
          backgroundMusic.oscillators.forEach(osc => {
            try {
              osc.stop();
            } catch (e) {
              // Oscillator already stopped
            }
          });
          
          if (backgroundMusic.audioContext.state !== 'closed') {
            backgroundMusic.audioContext.close();
          }
        }
      } catch (error) {
        console.log('Error stopping background music:', error);
      }
      setBackgroundMusic(null);
    }
  }, [backgroundMusic]);

  // Monster Detective clue generation
  const generateDetectiveClue = () => {
    console.log(`🕵️ Generating detective clue for ${userName}`);

    // Clear previous inputs and prefilled state
    setDetectiveInput({ factor1: '', factor2: '' });
    setFeedback({ show: false, correct: false, message: '', correctAnswer: 0 });

    // Helper function for better randomization (0-12 range)
    const getRandomFactor = () => {
      if (window.crypto && window.crypto.getRandomValues) {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return array[0] % 13; // 0-12
      }
      return Math.floor(Math.random() * 13); // 0-12
    };

    const clueTypes = ['product', 'missingFactor', 'factorRange', 'factorProperty', 'divisionPrep'];
    const selectedType = clueTypes[Math.floor(Math.random() * clueTypes.length)];

    let clue = '';
    let acceptedAnswers = [];
    let prefilledFactor = null;
    let prefilledPosition = null;

    if (selectedType === 'product') {
      // Generate a product dynamically instead of from a fixed list
      // Use two random factors to create more variety
      const factor1 = getRandomFactor();
      const factor2 = getRandomFactor();
      const product = factor1 * factor2;

      // Find all factor pairs for this product (within 0-12 range)
      acceptedAnswers = [];
      for (let i = 0; i <= 12; i++) {
        for (let j = i; j <= 12; j++) {
          if (i * j === product) {
            acceptedAnswers.push([i, j]);
          }
        }
      }

      // If product is 0, make the clue clearer
      if (product === 0) {
        clue = `My product is ${product}. What two numbers can you multiply to get ${product}? (Hint: one must be 0)`;
      } else {
        clue = `My product is ${product}. What two numbers can you multiply to get ${product}?`;
      }

    } else if (selectedType === 'missingFactor') {
      const factor1 = getRandomFactor();
      const factor2 = getRandomFactor();
      const product = factor1 * factor2;

      clue = `I multiplied ${factor1} by another number and got ${product}. What was the other number?`;
      acceptedAnswers = [[factor1, factor2]]; // Only one correct answer

    } else if (selectedType === 'factorRange') {
      // Both factors between certain ranges with more variety
      const minRange = Math.floor(Math.random() * 9); // 0-8
      const maxRange = Math.min(12, minRange + Math.floor(Math.random() * 5) + 2); // Range of 2-6 numbers

      const validPairs = [];
      for (let i = minRange; i <= maxRange && i <= 12; i++) {
        for (let j = i; j <= maxRange && j <= 12; j++) {
          if (i * j <= 144) {
            validPairs.push([i, j, i * j]);
          }
        }
      }

      if (validPairs.length > 0) {
        const selected = validPairs[Math.floor(Math.random() * validPairs.length)];
        clue = `Both my factors are between ${minRange} and ${maxRange}, and my product is ${selected[2]}. What are my factors?`;
        acceptedAnswers = [[selected[0], selected[1]]];
      } else {
        // Fallback to simpler clue
        return generateDetectiveClue();
      }

    } else if (selectedType === 'factorProperty') {
      const isEvenClue = Math.random() > 0.5;
      const knownFactor = getRandomFactor();

      let unknownFactor;
      if (isEvenClue) {
        // Unknown factor is even
        const evenFactors = [0, 2, 4, 6, 8, 10, 12];
        unknownFactor = evenFactors[Math.floor(Math.random() * evenFactors.length)];
      } else {
        // Unknown factor is odd
        const oddFactors = [1, 3, 5, 7, 9, 11];
        unknownFactor = oddFactors[Math.floor(Math.random() * oddFactors.length)];
      }

      const product = knownFactor * unknownFactor;
      clue = `One factor is ${isEvenClue ? 'even' : 'odd'}, the other is ${knownFactor}, and the product is ${product}. What's the ${isEvenClue ? 'even' : 'odd'} factor?`;
      acceptedAnswers = [[Math.min(knownFactor, unknownFactor), Math.max(knownFactor, unknownFactor)]];

    } else if (selectedType === 'divisionPrep') {
      // Division prep: give one factor and the product, ask for the other factor
      const factor1 = getRandomFactor();
      const factor2 = getRandomFactor();
      const product = factor1 * factor2;

      // Randomly choose which factor to give (position 1 or 2)
      const giveFirstFactor = Math.random() > 0.5;

      if (giveFirstFactor) {
        prefilledFactor = factor1;
        prefilledPosition = 1;
        clue = `My first number is ${factor1} and my product is ${product}. What's my second number?`;
        acceptedAnswers = [[factor1, factor2]];
      } else {
        prefilledFactor = factor2;
        prefilledPosition = 2;
        clue = `My second number is ${factor2} and my product is ${product}. What's my first number?`;
        acceptedAnswers = [[factor1, factor2]];
      }
    }

    setDetectiveClue({ type: selectedType, clue, acceptedAnswers, prefilledFactor, prefilledPosition });
    console.log(`✅ Detective clue generated:`, { type: selectedType, clue, acceptedAnswers });
  };

  const generateQuestion = () => {
    console.log(`🎲 Generating question for ${userName} (${userRole}) in session ${sessionCode}`);
    let a, b;
    let attempts = 0;
    const maxAttempts = 50; // Prevent infinite loops
    
    do {
      if (gameMode === 'advanced') {
        // For advanced mode: one factor is 1-9, other is 1-20
        // Improved randomization: use crypto.getRandomValues when available
        const getRandomInt = (min, max) => {
          if (window.crypto && window.crypto.getRandomValues) {
            const array = new Uint32Array(1);
            window.crypto.getRandomValues(array);
            return min + (array[0] % (max - min + 1));
          }
          return Math.floor(Math.random() * (max - min + 1)) + min;
        };
        
        const singleDigit = getRandomInt(1, 9);
        const largerNumber = getRandomInt(1, 20);
        
        // Randomly decide which position gets the single digit
        if (getRandomInt(0, 1) === 0) {
          a = singleDigit;
          b = largerNumber;
        } else {
          a = largerNumber;
          b = singleDigit;
        }
      } else {
        // For unlimited and timed modes: both factors 1-12
        // Improved randomization with better distribution
        const getRandomFactor = () => {
          if (window.crypto && window.crypto.getRandomValues) {
            const array = new Uint32Array(1);
            window.crypto.getRandomValues(array);
            return 1 + (array[0] % 12);
          }
          return Math.floor(Math.random() * 12) + 1;
        };
        
        a = getRandomFactor();
        b = getRandomFactor();
      }
      
      attempts++;
      
      // For timed games, avoid duplicates within the session
      const questionKey = `${Math.min(a, b)}x${Math.max(a, b)}`;
      if ((gameMode === 'timed' || gameMode === 'advanced') && usedQuestions.has(questionKey)) {
        if (attempts >= maxAttempts) {
          // If we've tried many times, allow duplicates rather than infinite loop
          // This handles edge cases where most combinations are exhausted
          break;
        }
        continue; // Try again with different numbers
      }
      
      // Add to used questions for timed games
      if (gameMode === 'timed' || gameMode === 'advanced') {
        setUsedQuestions(prev => new Set([...prev, questionKey]));
      }
      
      break; // Found a valid question
      
    } while (attempts < maxAttempts);
    
    setCurrentQuestion({ a, b });
    console.log(`✅ New question set: ${a} × ${b} = ? for ${userName}`);
    setFeedback({ show: false, correct: false, message: '', correctAnswer: 0 });
    setUserAnswer(''); // Ensure answer state is cleared for new question
    
    // Clear and focus the answer input when new question appears (for mobile gameplay speed)
    setTimeout(() => {
      if (answerInputRef.current && gameActive) {
        answerInputRef.current.value = ''; // Ensure input is cleared
        answerInputRef.current.focus();
      }
    }, 100); // Small delay to ensure DOM updates
  };

  const validateName = (name) => {
    const trimmedName = name.trim();

    // Check minimum length
    if (trimmedName.length < 2) {
      return { valid: false, error: "Please enter at least 2 characters" };
    }

    // Check for numbers
    if (/\d/.test(trimmedName)) {
      return { valid: false, error: "Please don't use numbers in your name" };
    }

    // Check for special characters (allow spaces, hyphens, apostrophes)
    if (!/^[a-zA-Z\s\-']+$/.test(trimmedName)) {
      return { valid: false, error: "Please use only letters, spaces, hyphens, and apostrophes" };
    }

    // Check for minimum 2 words (first and last name)
    const words = trimmedName.split(/\s+/).filter(word => word.length > 0);
    if (words.length < 2) {
      return { valid: false, error: "Please enter your first and last name" };
    }

    // Check for obviously fake names
    const fakeNames = [
      'butt', 'poop', 'pee', 'fart', 'stupid', 'dumb', 'hate', 'kill',
      'death', 'die', 'dead', 'gun', 'knife', 'bomb', 'test', 'asdf',
      'qwerty', 'aaaa', 'bbbb', 'cccc', 'dddd', 'eeee', 'ffff',
      'john doe', 'jane doe', 'mickey mouse', 'donald duck'
    ];

    const funnyMessages = [
      "Nice try, but your teacher needs to know who you really are! 😄",
      "Your secret identity is safe, but use your real name here! 🦸‍♀️",
      "That's a creative name, but let's go with your actual one! 🎭",
      "I see what you did there... but your teacher won't! Use your real name! 👀",
      "Your parents didn't name you that! Try your actual name! 👨‍👩‍👧‍👦",
      "Plot twist: your teacher can't give you credit if they don't know who you are! 📚",
      "Your real name is way cooler than that! Trust me! ⭐",
      "Your teacher's detective skills aren't that good - help them out with your real name! 🕵️‍♀️",
      "That name would be awesome for a video game character, but not for math class! 🎮",
      "I'm sure that's a great superhero name, but let's stick to reality! 🦸‍♂️"
    ];

    const lowerName = trimmedName.toLowerCase();
    for (const fake of fakeNames) {
      if (lowerName.includes(fake)) {
        const randomMessage = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
        return { valid: false, error: randomMessage };
      }
    }

    // Check for repeated characters (like "aaaa bbbb")
    if (/(.)\1{3,}/.test(trimmedName)) {
      const randomMessage = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
      return { valid: false, error: randomMessage };
    }

    return { valid: true };
  };

  const handleNameSubmit = () => {
    const validation = validateName(userName);

    if (!validation.valid) {
      setNameError(validation.error);
      return;
    }

    setNameError(''); // Clear any previous errors
    initializeAudio(); // Initialize audio on first interaction
    playSound('click');
    trackEvent('user_registered', 'Engagement', 'Name Entered');
    setGameMode('menu');
  };

  const handleNameKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    }
  };

  const startUnlimited = () => {
    initializeAudio(); // Initialize audio on game start
    playSound('click');
    trackEvent('game_start', 'Game', 'Training Mode');
    setGameMode('unlimited');
    setPreviousGameMode('unlimited');
    setScore({ correct: 0, total: 0 });
    setUsedQuestions(new Set()); // Clear used questions for new session
    setGameActive(true);
    generateQuestion();
    startBackgroundMusic();
  };

  const startTimed = () => {
    console.log('🚨 startTimed() called! isMultiplayer:', isMultiplayer, 'userRole:', userRole);
    console.trace('startTimed call stack');
    initializeAudio(); // Initialize audio on game start
    playSound('click');
    trackEvent('game_start', 'Game', 'Timed Mode (60s)');
    setGameMode('timed');
    setPreviousGameMode('timed');
    setScore({ correct: 0, total: 0 });
    setTimeLeft(60);
    setUsedQuestions(new Set()); // Clear used questions for new session
    
    // Start countdown, then actual game
    startCountdown(() => {
      setGameActive(true);
      generateQuestion();
      if (!isMultiplayer) {
        startBackgroundMusic();
      }
    });
  };

  const startAdvanced = () => {
    console.log('🚨 startAdvanced() called! isMultiplayer:', isMultiplayer, 'userRole:', userRole);
    console.trace('startAdvanced call stack');
    initializeAudio(); // Initialize audio on game start
    playSound('click');
    trackEvent('game_start', 'Game', 'Advanced Mode (60s)');
    setGameMode('advanced');
    setPreviousGameMode('advanced');
    setScore({ correct: 0, total: 0 });
    setTimeLeft(60);
    setUsedQuestions(new Set()); // Clear used questions for new session
    
    // Start countdown, then actual game
    startCountdown(() => {
      setGameActive(true);
      generateQuestion();
      if (!isMultiplayer) {
        startBackgroundMusic();
      }
    });
  };

  const startDetective = () => {
    initializeAudio(); // Initialize audio on game start
    playSound('click');
    trackEvent('game_start', 'Game', 'Monster Detective');
    setGameMode('detective');
    setPreviousGameMode('detective');
    setScore({ correct: 0, total: 0 });
    setDetectiveQuestionCount(1); // Start with question 1
    setUsedQuestions(new Set()); // Clear used questions for new session
    setGameActive(true);
    generateDetectiveClue();
    startBackgroundMusic();
  };

  const startTwoDigit = () => {
    initializeAudio(); // Initialize audio on game start
    playSound('click');
    trackEvent('game_start', 'Game', 'Two-Digit Multiplication');
    setGameMode('twoDigit');
    setPreviousGameMode('twoDigit');
    setScore({ correct: 0, total: 0 });
    setTwoDigitQuestionCount(1); // Start with question 1
    setUsedQuestions(new Set()); // Clear used questions for new session
    setGameActive(true);
    generateTwoDigitQuestion();
    startBackgroundMusic();
  };

  const generateTwoDigitQuestion = () => {
    console.log(`🔢 Generating two-digit question for ${userName}`);

    // Helper function for crypto-secure random generation
    const getRandomInt = (min, max) => {
      if (window.crypto && window.crypto.getRandomValues) {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return min + (array[0] % (max - min + 1));
      }
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    // Generate two-digit numbers (10-99)
    const a = getRandomInt(10, 99);
    const b = getRandomInt(10, 99);

    setCurrentQuestion({ a, b });
    console.log(`✅ New two-digit question: ${a} × ${b} = ?`);
    setFeedback({ show: false, correct: false, message: '', correctAnswer: 0 });
    setUserAnswer(''); // Clear answer state

    // Reset work state
    setTwoDigitWork({
      carry1: '', carry2: '',
      addCarry1: '', addCarry2: '', addCarry3: '',
      row1: { ones: '', tens: '', hundreds: '', thousands: '' },
      row2: { ones: '0', tens: '', hundreds: '', thousands: '' },
      sum: { ones: '', tens: '', hundreds: '', thousands: '' }
    });
  };

  const submitTwoDigitAnswer = () => {
    initializeAudio();
    playSound('submit');

    const a = currentQuestion.a;
    const b = currentQuestion.b;

    // Extract digits from a and b
    const a1 = Math.floor(a / 10); // tens digit of a
    const a0 = a % 10; // ones digit of a
    const b1 = Math.floor(b / 10); // tens digit of b
    const b0 = b % 10; // ones digit of b

    // Calculate correct partial products
    const partialProduct1 = a * b0; // First row (multiply by ones digit of b)
    const partialProduct2 = a * b1 * 10; // Second row (multiply by tens digit of b, shifted)
    const finalProduct = a * b;

    // Convert to digit strings for comparison
    const pp1String = partialProduct1.toString().padStart(4, '0');
    const pp2String = partialProduct2.toString().padStart(4, '0');
    const sumString = finalProduct.toString().padStart(4, '0');

    // Get user's answers
    const userRow1 = (twoDigitWork.row1.thousands || '0') + (twoDigitWork.row1.hundreds || '0') + (twoDigitWork.row1.tens || '0') + (twoDigitWork.row1.ones || '0');
    const userRow2 = (twoDigitWork.row2.thousands || '0') + (twoDigitWork.row2.hundreds || '0') + (twoDigitWork.row2.tens || '0') + (twoDigitWork.row2.ones || '0');
    const userSum = (twoDigitWork.sum.thousands || '0') + (twoDigitWork.sum.hundreds || '0') + (twoDigitWork.sum.tens || '0') + (twoDigitWork.sum.ones || '0');

    // Check if all work is correct
    const row1Correct = parseInt(userRow1) === partialProduct1;
    const row2Correct = parseInt(userRow2) === partialProduct2;
    const sumCorrect = parseInt(userSum) === finalProduct;
    const isCorrect = row1Correct && row2Correct && sumCorrect;

    // Track answer submission
    trackEvent('answer_submitted', 'Gameplay', `twoDigit - ${isCorrect ? 'Correct' : 'Incorrect'}`, finalProduct);

    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    setTimeout(() => {
      if (isCorrect) {
        playSound('correct');
        const encouragingMessages = [
          `👾 Monster defeated, ${userName}!`,
          `🎃 Spook-tacular work, ${userName}!`,
          `🦄 Magical math powers, ${userName}!`,
          `🐲 Dragon slayer, ${userName}!`,
          `🚀 Rocket monster, ${userName}!`
        ];
        const randomMessage = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
        setFeedback({ show: true, correct: true, message: randomMessage, correctAnswer: finalProduct });

        // Auto-advance on correct answer
        setTimeout(() => {
          setFeedback({ show: false, correct: false, message: '', correctAnswer: 0 });
          if (gameActive) {
            if (twoDigitQuestionCount < twoDigitMaxQuestions) {
              setTwoDigitQuestionCount(prev => prev + 1);
              generateTwoDigitQuestion();
            } else {
              endGame();
            }
          }
        }, 1500);
      } else {
        playSound('incorrect');
        let errorMessage = '🤔 Check your work! ';
        if (!row1Correct) errorMessage += `First row should be ${partialProduct1}. `;
        if (!row2Correct) errorMessage += `Second row should be ${partialProduct2}. `;
        if (!sumCorrect) errorMessage += `Sum should be ${finalProduct}.`;
        setFeedback({ show: true, correct: false, message: errorMessage, correctAnswer: finalProduct });
        // Don't auto-advance on wrong answer - user chooses
      }
    }, 150);
  };

  const moveToNextTwoDigitQuestion = () => {
    setFeedback({ show: false, correct: false, message: '', correctAnswer: 0 });
    if (gameActive) {
      if (twoDigitQuestionCount < twoDigitMaxQuestions) {
        setTwoDigitQuestionCount(prev => prev + 1);
        generateTwoDigitQuestion();
      } else {
        endGame();
      }
    }
  };

  const retryTwoDigitQuestion = () => {
    setFeedback({ show: false, correct: false, message: '', correctAnswer: 0 });
  };

  const submitDetectiveAnswer = () => {
    let factor1 = parseInt(detectiveInput.factor1);
    let factor2 = parseInt(detectiveInput.factor2);

    // For division prep, use prefilled factor if available
    if (detectiveClue.prefilledFactor !== null) {
      if (detectiveClue.prefilledPosition === 1) {
        factor1 = detectiveClue.prefilledFactor;
      } else if (detectiveClue.prefilledPosition === 2) {
        factor2 = detectiveClue.prefilledFactor;
      }
    }

    // For division prep, we only need to check the non-prefilled input
    if (detectiveClue.type === 'divisionPrep') {
      const nonPrefilledInput = detectiveClue.prefilledPosition === 1 ? factor2 : factor1;
      if (isNaN(nonPrefilledInput) || nonPrefilledInput < 0 || nonPrefilledInput > 12) {
        return; // Invalid input
      }
    } else {
      // For other clue types, check both inputs (0-12 range)
      if (isNaN(factor1) || isNaN(factor2) || factor1 < 0 || factor2 < 0 || factor1 > 12 || factor2 > 12) {
        return; // Invalid input
      }
    }

    // Clear any existing feedback immediately
    setFeedback({ show: false, correct: false, message: '', correctAnswer: 0 });

    initializeAudio();
    playSound('submit');

    // Check if the answer is correct
    let isCorrect = false;
    let correctAnswerText = '';

    // Special case: If one of the expected factors is 0 and product is 0,
    // then any valid number (0-12) for the other factor is correct
    const product = factor1 * factor2;
    const hasZeroFactor = detectiveClue.acceptedAnswers.some(ans => ans[0] === 0 || ans[1] === 0);

    if (hasZeroFactor && product === 0) {
      // Any valid input is correct when multiplying by 0
      isCorrect = true;
    } else {
      // Check against all accepted answers - accept factors in any order
      for (let answer of detectiveClue.acceptedAnswers) {
        // Check if the input matches the expected answer in either order
        if ((factor1 === answer[0] && factor2 === answer[1]) ||
            (factor1 === answer[1] && factor2 === answer[0])) {
          isCorrect = true;
          break;
        }
      }
    }
    
    // Format correct answer text for feedback - show all valid combinations
    if (detectiveClue.acceptedAnswers.length === 1) {
      const ans = detectiveClue.acceptedAnswers[0];
      // For single answers, show both possible orders if they're different
      if (ans[0] === ans[1]) {
        correctAnswerText = `${ans[0]} × ${ans[1]} = ${ans[0] * ans[1]}`;
      } else {
        correctAnswerText = `${ans[0]} × ${ans[1]} (or ${ans[1]} × ${ans[0]}) = ${ans[0] * ans[1]}`;
      }
    } else {
      // For multiple answers, show all combinations
      const answerTexts = detectiveClue.acceptedAnswers.map(ans => {
        if (ans[0] === ans[1]) {
          return `${ans[0]} × ${ans[1]}`;
        } else {
          return `${ans[0]} × ${ans[1]} or ${ans[1]} × ${ans[0]}`;
        }
      });
      correctAnswerText = answerTexts.join(', ');
    }
    
    // Track answer submission
    trackEvent('detective_answer', 'Gameplay', `Detective - ${isCorrect ? 'Correct' : 'Incorrect'}`);
    
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    setTimeout(() => {
      if (isCorrect) {
        playSound('correct');
        const detectiveMessages = [
          `🕵️ Case solved, Detective ${userName}!`,
          `🔍 Brilliant deduction, ${userName}!`,
          `🎯 Mystery cracked, Detective ${userName}!`,
          `⚡ Sharp investigation, ${userName}!`,
          `🏆 Master detective work, ${userName}!`,
          `🧠 Clever reasoning, Detective ${userName}!`,
          `✨ Outstanding detective, ${userName}!`,
          `🎉 Another case closed, ${userName}!`,
          `🌟 Superb sleuthing, Detective ${userName}!`,
          `🚀 Detective genius, ${userName}!`
        ];
        const randomMessage = detectiveMessages[Math.floor(Math.random() * detectiveMessages.length)];
        setFeedback({ show: true, correct: true, message: randomMessage, correctAnswer: correctAnswerText });

        // Auto-advance to next question after correct answer
        setTimeout(() => {
          setFeedback({ show: false, correct: false, message: '', correctAnswer: '' });
          if (gameActive) {
            if (detectiveQuestionCount >= detectiveMaxQuestions) {
              endGame();
            } else {
              setDetectiveQuestionCount(prev => prev + 1);
              generateDetectiveClue();
            }
          }
        }, 1500);
      } else {
        playSound('incorrect');
        const helpfulMessages = [
          '🤔 This clue needs more investigation!',
          '🔍 Check your detective work again!',
          '💭 Good attempt, keep investigating!',
          '🎯 The mystery continues!',
          '💡 Try a different angle, detective!',
          '🧐 This case is tricky!',
          '⚡ Keep those detective skills sharp!',
          '🌱 Every detective learns from each case!'
        ];
        const randomMessage = helpfulMessages[Math.floor(Math.random() * helpfulMessages.length)];
        setFeedback({ show: true, correct: false, message: randomMessage, correctAnswer: correctAnswerText });
        // For wrong answers, don't auto-advance - user must click "Next Question"
      }
    }, 150);

    // Clear input fields
    setDetectiveInput({ factor1: '', factor2: '' });
  };

  const moveToNextDetectiveQuestion = () => {
    setFeedback({ show: false, correct: false, message: '', correctAnswer: '' });
    if (gameActive) {
      if (detectiveQuestionCount >= detectiveMaxQuestions) {
        endGame();
      } else {
        setDetectiveQuestionCount(prev => prev + 1);
        generateDetectiveClue();
      }
    }
  };

  const submitAnswer = () => {
    if (!userAnswer.trim()) return;

    // Clear any existing feedback immediately when submitting new answer
    setFeedback({ show: false, correct: false, message: '', correctAnswer: 0 });

    initializeAudio(); // Initialize audio on interaction
    playSound('submit');

    const correctAnswer = currentQuestion.a * currentQuestion.b;
    const isCorrect = parseInt(userAnswer) === correctAnswer;
    
    // Track answer submission
    trackEvent('answer_submitted', 'Gameplay', `${gameMode} - ${isCorrect ? 'Correct' : 'Incorrect'}`, correctAnswer);
    
    setScore(prev => {
      const newScore = {
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1
      };
      
      // Update multiplayer session if in multiplayer mode
      if (isMultiplayer && sessionCode && userRole === 'student') {
        const newStreak = isCorrect ? currentStreak + 1 : 0;
        setCurrentStreak(newStreak);
        updateStudentScore(sessionCode, userName, newScore, newStreak);
      }
      
      return newScore;
    });

    setTimeout(() => {
      if (isCorrect) {
        playSound('correct');
        const encouragingMessages = [
          `👾 Monster defeated, ${userName}!`,
          `🎃 Spook-tacular work, ${userName}!`,
          `🦄 Magical math powers, ${userName}!`,
          `🐲 Dragon slayer, ${userName}!`,
          `🚀 Rocket monster, ${userName}!`,
          `🏆 Math monster champion, ${userName}!`,
          `🔥 Blazing monster hunter, ${userName}!`,
          `⚡ Lightning monster, ${userName}!`,
          `🌈 Rainbow monster master, ${userName}!`,
          `💪 Strong monster warrior, ${userName}!`,
          `🤩 Super monster hero, ${userName}!`,
          `🎯 Monster targeting expert, ${userName}!`,
          `🎆 Fireworks monster, ${userName}!`,
          `😎 Cool monster tamer, ${userName}!`,
          `👍 Monster approved, ${userName}!`,
          `🌟 Stellar monster fighter, ${userName}!`,
          `🔍 Sharp-eyed monster hunter, ${userName}!`,
          `🎨 Artistic monster creator, ${userName}!`,
          `💡 Bright monster genius, ${userName}!`,
          `🎓 Monster math scholar, ${userName}!`,
          `🚀 Speedy monster racer, ${userName}!`,
          `✨ Enchanted monster mage, ${userName}!`,
          `🎉 Party monster, ${userName}!`,
          `🏅 Monster championship winner, ${userName}!`,
          `🔥 Hot monster streak, ${userName}!`,
          `👹 Boss monster conquered, ${userName}!`,
          `🤖 Robot monster ally, ${userName}!`,
          `🐙 Tentacle monster friend, ${userName}!`
        ];
        const randomMessage = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
        setFeedback({ show: true, correct: true, message: randomMessage, correctAnswer });
      } else {
        playSound('incorrect');
        const helpfulMessages = [
          '🤔 Monster escaped this time!',
          '💭 Nice attempt, monster trainer!',
          '🎯 Almost caught that monster!',
          '🌱 Growing stronger against monsters!',
          '💪 Training with monsters is tough!',
          '👾 The monster was tricky!',
          '🎃 Spooky math challenge!',
          '🐙 That monster was sneaky!'
        ];
        const randomMessage = helpfulMessages[Math.floor(Math.random() * helpfulMessages.length)];
        setFeedback({ show: true, correct: false, message: randomMessage, correctAnswer });
      }
    }, 150);

    setUserAnswer('');
    
    // Ensure input field is cleared and focused (especially important for multiplayer)
    if (answerInputRef.current) {
      answerInputRef.current.value = '';
      setTimeout(() => {
        if (answerInputRef.current && gameActive) {
          answerInputRef.current.focus();
        }
      }, 100);
    }
    
    // Give more time to read the correct answer when user gets it wrong
    const feedbackDuration = isCorrect ? 1500 : 2500; // 1 second longer for wrong answers
    
    // Clear any existing question timeout
    if (questionTimeoutRef.current) {
      clearTimeout(questionTimeoutRef.current);
    }
    
    // Set timeout to clear feedback and generate new question
    questionTimeoutRef.current = setTimeout(() => {
      // Always clear feedback regardless of game state
      setFeedback({ show: false, correct: false, message: '', correctAnswer: 0 });

      // Only generate new question if game is still active
      if (gameActive) {
        // Handle two-digit mode progression
        if (gameMode === 'twoDigit') {
          if (twoDigitQuestionCount < twoDigitMaxQuestions) {
            setTwoDigitQuestionCount(prev => prev + 1);
            generateTwoDigitQuestion();
          } else {
            // End game after 10 questions
            endGame();
          }
        } else {
          generateQuestion();
        }
      }

      questionTimeoutRef.current = null;
    }, feedbackDuration);
    
    // Additional safety: clear feedback after a maximum time regardless of conditions
    setTimeout(() => {
      setFeedback({ show: false, correct: false, message: '', correctAnswer: 0 });
    }, Math.max(feedbackDuration, 3000)); // Ensure feedback is cleared after max 3 seconds
  };

  const endGame = useCallback(() => {
    playSound('click');
    stopBackgroundMusic();
    
    // Only play end music for single-player games
    if (!isMultiplayer) {
      playEndMusic();
    }
    
    setGameActive(false);
    
    // Track game completion
    const percentage = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    trackEvent('game_completed', 'Game', gameMode, percentage);
    trackEvent('score_achieved', 'Performance', `${score.correct}/${score.total}`, percentage);
    
    // Save score to history for timed modes
    if (gameMode === 'timed' || gameMode === 'advanced') {
      const newScore = {
        attempts: score.total,
        correct: score.correct,
        percentage: percentage,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setScoreHistory(prev => ({
        ...prev,
        [gameMode]: [...prev[gameMode], newScore]
      }));
      setPreviousGameMode(gameMode);
    }
    
    // For multiplayer, go to multiplayer results; otherwise regular results
    if (isMultiplayer) {
      setGameMode('multiplayerResults');
    } else {
      setGameMode('results');
    }
  }, [gameMode, score.total, score.correct, stopBackgroundMusic, isMultiplayer]);

  useEffect(() => {
    let timer;

    // Timer logic - different for multiplayer vs single player
    if (isMultiplayer && (gameMode === 'teacherMonitor' || ((gameMode === 'timed' || gameMode === 'advanced') && userRole === 'student'))) {
      // Multiplayer mode: calculate time based on server timestamp
      if (sessionData && sessionData.startedAt && gameActive) {
        timer = setInterval(() => {
          const now = new Date();
          const startTime = sessionData.startedAt.toDate();
          const elapsed = Math.floor((now - startTime) / 1000);
          const remaining = Math.max(0, (sessionData.timeLimit || 60) - elapsed);

          setTimeLeft(remaining);

          if (remaining === 0) {
            if (gameMode === 'teacherMonitor') {
              setGameActive(false);
              playSound('end');
            } else {
              playSound('end');
              endGame();
            }
          }
        }, 1000);
      }
    } else if (gameMode === 'squadBattle' && gameActive) {
      // Squad battle mode: countdown timer (not paused by feedback)
      if (timeLeft > 0) {
        // Play countdown sounds for last 5 seconds
        if (timeLeft <= 5 && timeLeft > 1) {
          playSound('countdown');
        } else if (timeLeft === 1) {
          playSound('countdownFinal');
        }
        timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      } else if (timeLeft === 0) {
        setGameActive(false);
        playSound('end');
        // Results will be shown by the component when timeLeft === 0
      }
    } else if (!isMultiplayer) {
      // Single player mode: use local timer with feedback pausing
      if ((gameMode === 'timed' || gameMode === 'advanced') && timeLeft > 0 && gameActive && !feedback.show) {
        timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      } else if ((gameMode === 'timed' || gameMode === 'advanced') && timeLeft === 0) {
        endGame();
      }
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
        clearInterval(timer);
      }
    };
  }, [gameMode, timeLeft, gameActive, feedback.show, endGame, isMultiplayer, userRole, sessionData]);

  // Cleanup background music on unmount
  useEffect(() => {
    return () => {
      stopBackgroundMusic();
    };
  }, [stopBackgroundMusic]);

  // Navigate to battle when squad battle starts
  useEffect(() => {
    if (gameMode === 'squadLobby' && squadData?.isStarted) {
      playSound('start');

      // Set appropriate game mode based on battle type
      if (squadData.battleType === 'survival') {
        setGameMode('squadSurvival');
      } else {
        setGameMode('squadBattle');
      }
    }
  }, [gameMode, squadData?.isStarted, squadData?.battleType, playSound]);

  // Auto-start squad battle when entering battle mode
  useEffect(() => {
    if (gameMode === 'squadBattle' && !gameActive && squadData?.isStarted) {
      // Only start if we haven't played yet (timeLeft will be 60 from initial state or reset)
      // When timer naturally ends, timeLeft will be 0 and gameActive will be false
      // so we check timeLeft !== 0 to prevent restart
      if (timeLeft !== 0) {
        setGameActive(true);
        const timeLimit = squadData?.battleType === 'quickClash' ? 180 : 180;
        setTimeLeft(timeLimit);
        generateQuestion();
      }
    }
  }, [gameMode, gameActive, squadData?.isStarted, squadData?.battleType, generateQuestion, timeLeft]);

  // Auto-start squad survival when entering survival mode
  useEffect(() => {
    if (gameMode === 'squadSurvival' && !gameActive && squadData?.isStarted) {
      setGameActive(true);
      setPlayerLives(3); // Reset lives
      setIsEliminated(false); // Reset elimination status
      generateQuestion();
    }
  }, [gameMode, gameActive, squadData?.isStarted, generateQuestion]);

  // Play end sound when survival game is over
  useEffect(() => {
    if (gameMode === 'squadSurvival' && squadData?.players) {
      const activePlayers = squadData.players.filter(p => !p.isEliminated);
      const gameOver = activePlayers.length <= 1;
      if (gameOver && squadData.isStarted) {
        playSound('end');
      }
    }
  }, [gameMode, squadData?.players, squadData?.isStarted]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      submitAnswer();
    }
  };

  const backToMenu = async () => {
    playSound('click');
    stopBackgroundMusic();
    
    // Clear any existing question timeout
    if (questionTimeoutRef.current) {
      clearTimeout(questionTimeoutRef.current);
      questionTimeoutRef.current = null;
    }
    
    // Complete multiplayer cleanup
    await cleanupMultiplayerState();
    
    // Reset all game state
    setGameMode('menu');
    setUserAnswer('');
    setScore({ correct: 0, total: 0 });
    setTimeLeft(60);
    setGameActive(false);
    setFeedback({ show: false, correct: false, message: '', correctAnswer: 0 });
    
    // Reset detective-specific state
    setDetectiveQuestionCount(0);
    setDetectiveInput({ factor1: '', factor2: '' });
    setDetectiveClue({ type: '', clue: '', acceptedAnswers: [], prefilledFactor: null, prefilledPosition: null });
  };

  const clearHistory = (mode) => {
    playSound('click');
    setScoreHistory(prev => ({
      ...prev,
      [mode]: []
    }));
  };

  if (gameMode === 'nameInput') {
    return (
      <div className="App">
        <div className="floating-ghost">👻</div>
        <div className="floating-skull">💀</div>
        <div className="floating-robot">🤖</div>
        <div className="floating-demon">👹</div>
        <div className="menu-container">
          <h1>Multiply Monsters</h1>
          <p>Welcome to the monster math kingdom! Let's multiply with monsters!</p>
          <div className="name-input-container">
            <label htmlFor="name-input">What's your name?</label>
            <div className="name-guidelines">
              <p>Enter your first and last name so your teacher can identify you</p>
              <div className="name-examples">
                <span className="good-example">✅ Emma Johnson</span>
                <span className="good-example">✅ Alex Smith</span>
              </div>
            </div>
            <input
              id="name-input"
              type="text"
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
                if (nameError) setNameError(''); // Clear error when user starts typing
              }}
              onKeyPress={handleNameKeyPress}
              className="name-input"
              placeholder="First Last"
              autoFocus
              maxLength={30}
            />
            {nameError && (
              <div className="name-error">
                ❌ {nameError}
              </div>
            )}
            <button 
              onClick={handleNameSubmit} 
              className="submit-button"
              disabled={!userName.trim()}
            >
              🚀 Enter the monster kingdom!
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameMode === 'menu') {
    return (
      <div className="App">
        <div className="floating-ghost">👻</div>
        <div className="floating-skull">💀</div>
        <div className="floating-robot">🤖</div>
        <div className="floating-demon">👹</div>
        <div className="menu-container">
          <h1>Multiply Monsters</h1>
          <p>Hi {userName}! Choose your adventure!</p>
          
          <div className="game-modes-grid">
            <div className="mode-section">
              <h3 className="section-title">Solo Adventures</h3>
              <div className="mode-cards">
                <button className="mode-card training" onClick={startUnlimited}>
                  <div className="card-icon">🐉</div>
                  <div className="card-content">
                    <h4>Training</h4>
                    <p>Practice basics</p>
                  </div>
                </button>

                <button className="mode-card detective" onClick={startDetective}>
                  <div className="card-icon">🕵️</div>
                  <div className="card-content">
                    <h4>Detective</h4>
                    <p>Solve mysteries</p>
                  </div>
                </button>

                <button className="mode-card twodigit" onClick={startTwoDigit}>
                  <div className="card-icon">🔢</div>
                  <div className="card-content">
                    <h4>Two-Digit</h4>
                    <p>10 questions</p>
                  </div>
                </button>
              </div>
            </div>
            
            <div className="mode-section">
              <h3 className="section-title">Timed Challenges</h3>
              <div className="mode-cards">
                <button className="mode-card timed" onClick={startTimed}>
                  <div className="card-icon">⏱️</div>
                  <div className="card-content">
                    <h4>Monster race</h4>
                    <p>60-second sprint</p>
                  </div>
                </button>
                
                <button className="mode-card advanced" onClick={startAdvanced}>
                  <div className="card-icon">👺</div>
                  <div className="card-content">
                    <h4>Boss battle</h4>
                    <p>Ultimate challenge</p>
                  </div>
                </button>
              </div>
            </div>
            
            <div className="mode-section">
              <h3 className="section-title">Classroom</h3>
              <div className="mode-cards">
                <button className="mode-card multiplayer" onClick={() => setGameMode('multiplayerSelect')}>
                  <div className="card-icon">👥</div>
                  <div className="card-content">
                    <h4>Battle mode</h4>
                    <p>Teacher-led classroom</p>
                  </div>
                </button>

                <button className="mode-card squad" onClick={() => setGameMode('squadSelect')}>
                  <div className="card-icon">⚔️</div>
                  <div className="card-content">
                    <h4>Squad Showdown</h4>
                    <p>Battle with friends</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
          
          <div className="version-footer">
            <button className="version-link" onClick={() => setGameMode('changelog')}>
              {APP_VERSION}
            </button>
            <span className="copyright-text">
              Copyright {new Date().getFullYear()}, Eric Ellis Design
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Multiplayer Mode Selection
  if (gameMode === 'multiplayerSelect') {
    return (
      <div className="App">
        <div className="floating-ghost">👻</div>
        <div className="floating-skull">💀</div>
        <div className="floating-robot">🤖</div>
        <div className="floating-demon">👹</div>
        <div className="menu-container">
          <h1>Classroom battle mode</h1>
          <p>Join your classmates in an epic monster math battle!</p>
          <p className="teacher-guide-paragraph"><a href="./Multiplication Trainer - Battle Mode Teacher Guide.pdf" target="_blank" rel="noopener noreferrer" className="teacher-guide-link">Teacher Guide: How to Use Battle Mode in Your Classroom</a></p>
          <div className="menu-buttons">
            <button className="mode-button teacher" onClick={() => setGameMode('createSession')}>
              🍎 Create classroom session
              <span className="mode-description">Teachers: start a new math battle for your students!</span>
            </button>
            <button className="mode-button student" onClick={() => setGameMode('joinSession')}>
              🎒 Join classroom session
              <span className="mode-description">Students: enter a session code to join the battle!</span>
            </button>
            <button className="mode-button back" onClick={() => setGameMode('menu')}>
              ← Back to menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Monster Squad Showdown Selection
  if (gameMode === 'squadSelect') {
    return (
      <div className="App">
        <div className="floating-ghost">👻</div>
        <div className="floating-skull">💀</div>
        <div className="floating-robot">🤖</div>
        <div className="floating-demon">👹</div>
        <div className="menu-container">
          <h1>Monster Squad Showdown</h1>
          <p>Battle with friends in small group competitions!</p>
          <div className="menu-buttons">
            <button className="mode-button squad-create" onClick={() => setGameMode('createSquadBattle')}>
              ⚔️ Start Squad Battle
              <span className="mode-description">Create a battle and invite friends to join!</span>
            </button>
            <button className="mode-button squad-join" onClick={() => setGameMode('joinSquadBattle')}>
              🛡️ Join Squad Battle
              <span className="mode-description">Enter a 3-character code to join a friend's battle!</span>
            </button>
            <button className="mode-button back" onClick={() => setGameMode('menu')}>
              ← Back to menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Create Squad Battle - Battle Type Selection
  if (gameMode === 'createSquadBattle') {
    const handleCreateSquadBattle = async (battleType) => {
      console.log('🚀 Starting squad battle creation...', { userName, battleType });
      setIsCreatingSquad(true);
      setSquadBattleType(battleType);

      try {
        const result = await createSquadBattle(userName, battleType);
        console.log('📊 Squad battle creation result:', result);

        if (result.success) {
          console.log('✅ Squad battle created successfully:', result.code);
          setSquadCode(result.code);
          setIsSquadHost(true);
          setIsSquadBattle(true);
          setGameMode('squadLobby');

          // Subscribe to squad battle updates
          const unsubscribe = listenToSquadBattle(result.code, (data) => {
            if (data) {
              setSquadData(data);
              setPlayersReady(new Set(data.readyPlayers || []));
            } else {
              console.log('Squad battle no longer exists');
              setGameMode('menu');
            }
          });
          setSquadUnsubscribe(() => unsubscribe);

        } else {
          console.error('❌ Failed to create squad battle:', result.error);
          alert(`Failed to create squad battle: ${result.error}`);
        }
      } catch (error) {
        console.error('💥 Error during squad battle creation:', error);
        alert('Error creating squad battle. Please try again.');
      } finally {
        setIsCreatingSquad(false);
      }
    };

    return (
      <div className="App">
        <div className="floating-ghost">👻</div>
        <div className="floating-skull">💀</div>
        <div className="floating-robot">🤖</div>
        <div className="floating-demon">👹</div>
        <div className="menu-container">
          <h1>Choose Your Battle</h1>
          <p>Select a battle type to challenge your friends!</p>
          <div className="menu-buttons">
            <button
              className="mode-button squad-battle-type quick-clash-card"
              onClick={() => handleCreateSquadBattle('quickClash')}
              disabled={isCreatingSquad}
            >
              ⚡ Quick Clash
              <span className="mode-description">3 minutes • Fast-paced competition</span>
            </button>

            <button
              className="mode-button squad-battle-type survival-card"
              onClick={() => handleCreateSquadBattle('survival')}
              disabled={isCreatingSquad}
            >
              💀 Survival
              <span className="mode-description">Last player standing wins!</span>
            </button>

            <button
              className="mode-button back"
              onClick={() => setGameMode('squadSelect')}
              disabled={isCreatingSquad}
            >
              ← Back to squad options
            </button>
          </div>

          {isCreatingSquad && (
            <div className="loading-message">
              Creating your squad battle...
            </div>
          )}
        </div>
      </div>
    );
  }

  // Squad Lobby - Players wait and ready up
  if (gameMode === 'squadLobby') {
    const handlePlayerReady = async () => {
      const newReadyState = !isPlayerReady;
      setIsPlayerReady(newReadyState);

      await updatePlayerReady(squadCode, userName, newReadyState);
      playSound('click');
    };

    const handleStartBattle = async () => {
      if (!isSquadHost) return;

      const allPlayersReady = squadData?.players?.every(p => p.isReady) || false;
      const hasMinPlayers = squadData?.players?.length >= 2;

      if (!allPlayersReady) {
        alert('All players must be ready before starting the battle!');
        return;
      }

      if (!hasMinPlayers) {
        alert('Need at least 2 players to start a battle!');
        return;
      }

      await startSquadBattle(squadCode);
      playSound('click');

      // The battle will start automatically when Firebase updates
    };

    const handleLeaveBattle = async () => {
      if (squadUnsubscribe) {
        squadUnsubscribe();
        setSquadUnsubscribe(null);
      }

      await leaveSquadBattle(squadCode, userName);

      // Reset squad states
      setIsSquadBattle(false);
      setSquadCode('');
      setSquadData(null);
      setIsSquadHost(false);
      setIsPlayerReady(false);
      setPlayersReady(new Set());

      setGameMode('menu');
    };

    const getBattleTypeDisplay = () => {
      const type = squadData?.battleType;
      switch (type) {
        case 'quickClash': return { name: 'Quick Clash', emoji: '⚡', time: '3 minutes' };
        case 'survival': return { name: 'Survival', emoji: '💀', time: 'Until elimination' };
        default: return { name: 'Unknown', emoji: '⚔️', time: '' };
      }
    };

    const getBattleTypeClass = () => {
      const type = squadData?.battleType;
      switch (type) {
        case 'quickClash': return 'quick-clash-lobby';
        case 'survival': return 'survival-lobby';
        default: return '';
      }
    };

    const battleInfo = getBattleTypeDisplay();
    const lobbyClass = getBattleTypeClass();
    const allReady = squadData?.players?.every(p => p.isReady) || false;
    const playerCount = squadData?.players?.length || 0;
    const maxPlayers = 6;

    return (
      <div className="App">
        <div className="floating-ghost">👻</div>
        <div className="floating-skull">💀</div>
        <div className="floating-robot">🤖</div>
        <div className="floating-demon">👹</div>
        <div className={`menu-container ${lobbyClass}`}>
          <h1>{battleInfo.emoji} {battleInfo.name} Lobby</h1>
          <div className="squad-code-display">
            <h2>Squad Code: <span className="code-highlight">{squadCode}</span></h2>
            <p>Share this code with your friends!</p>
          </div>

          <div className="battle-info">
            <p><strong>Battle Type:</strong> {battleInfo.name}</p>
            <p><strong>Duration:</strong> {battleInfo.time}</p>
            <p><strong>Difficulty:</strong> 1-12 multiplication tables</p>
          </div>

          <div className="players-section">
            <h3>Players ({playerCount}/{maxPlayers})</h3>
            <div className="players-list">
              {squadData?.players?.map((player, index) => (
                <div key={player.name} className={`player-item ${player.isHost ? 'host' : ''} ${player.isReady ? 'ready' : 'not-ready'}`}>
                  <div className="player-info">
                    <span className="player-name">
                      {player.isHost && '👑 '}
                      {player.name}
                    </span>
                    <span className={`ready-status ${player.isReady ? 'ready' : 'not-ready'}`}>
                      {player.isReady ? '✅ Ready' : '⏳ Not Ready'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lobby-actions">
            <button
              className={`mode-button ready-button ${isPlayerReady ? 'ready' : 'not-ready'}`}
              onClick={handlePlayerReady}
            >
              {isPlayerReady ? '✅ Ready!' : '⏳ I\'m Ready!'}
            </button>

            {isSquadHost && (
              <button
                className="mode-button start-battle"
                onClick={handleStartBattle}
                disabled={!allReady || playerCount < 2}
              >
                🚀 Start Battle!
                {!allReady && <span className="button-note">All players must be ready</span>}
                {playerCount < 2 && <span className="button-note">Need at least 2 players</span>}
              </button>
            )}

            <button className="mode-button back" onClick={handleLeaveBattle}>
              ← Leave Squad
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Join Squad Battle - Enter Code
  if (gameMode === 'joinSquadBattle') {
    const handleJoinSquadBattle = async () => {
      if (!squadInputCode.trim()) {
        alert('Please enter a squad code!');
        return;
      }

      const codeToJoin = squadInputCode.trim().toUpperCase();
      setIsJoiningSquad(true);

      try {
        console.log('🚀 Attempting to join squad battle:', codeToJoin);
        const result = await joinSquadBattle(codeToJoin, userName);

        if (result.success) {
          console.log('✅ Successfully joined squad battle');
          setSquadCode(codeToJoin);
          setIsSquadBattle(true);
          setIsSquadHost(false);
          setGameMode('squadLobby');

          // Subscribe to squad battle updates
          const unsubscribe = listenToSquadBattle(codeToJoin, (data) => {
            if (data) {
              setSquadData(data);
              setPlayersReady(new Set(data.readyPlayers || []));
            } else {
              console.log('Squad battle no longer exists');
              alert('Squad battle ended or no longer exists');
              setGameMode('menu');
            }
          });
          setSquadUnsubscribe(() => unsubscribe);

        } else {
          console.error('❌ Failed to join squad:', result.error);
          alert(`Could not join squad: ${result.error}`);
        }
      } catch (error) {
        console.error('💥 Error joining squad:', error);
        alert('Error joining squad battle. Please try again.');
      } finally {
        setIsJoiningSquad(false);
      }
    };

    const handleCodeKeyPress = (e) => {
      if (e.key === 'Enter') {
        handleJoinSquadBattle();
      }
    };

    return (
      <div className="App">
        <div className="floating-ghost">👻</div>
        <div className="floating-skull">💀</div>
        <div className="floating-robot">🤖</div>
        <div className="floating-demon">👹</div>
        <div className="menu-container">
          <h1>Join Squad Battle</h1>
          <p>Enter the 3-character code your friend shared with you!</p>

          <div className="code-input-section">
            <label htmlFor="squad-code-input">Squad Code</label>
            <input
              id="squad-code-input"
              type="text"
              value={squadInputCode}
              onChange={(e) => setSquadInputCode(e.target.value.toUpperCase())}
              onKeyPress={handleCodeKeyPress}
              className="squad-code-input"
              placeholder="ABC"
              maxLength={3}
              autoFocus
              disabled={isJoiningSquad}
            />
          </div>

          <div className="menu-buttons">
            <button
              className="mode-button squad-join-confirm"
              onClick={handleJoinSquadBattle}
              disabled={!squadInputCode.trim() || isJoiningSquad}
            >
              🛡️ Join Battle!
              {isJoiningSquad && <span className="mode-description">Joining...</span>}
            </button>

            <button
              className="mode-button back"
              onClick={() => setGameMode('squadSelect')}
              disabled={isJoiningSquad}
            >
              ← Back to squad options
            </button>
          </div>

          {isJoiningSquad && (
            <div className="loading-message">
              Joining squad battle...
            </div>
          )}
        </div>
      </div>
    );
  }

  // Squad Battle - Quick Clash & Epic Duel
  if (gameMode === 'squadBattle') {
    const handleSquadSubmitAnswer = async () => {
      const answer = parseInt(userAnswer);
      const correctAnswer = currentQuestion.a * currentQuestion.b;
      const isCorrect = answer === correctAnswer;

      if (isCorrect) {
        const newScore = score.correct + 1;
        const newStreak = currentStreak + 1;
        setScore({ ...score, correct: newScore, total: score.total + 1 });
        setCurrentStreak(newStreak);

        // Update score in Firebase
        await updateSquadPlayerScore(squadCode, userName, newScore, newStreak);

        setFeedback({
          show: true,
          correct: true,
          message: `Correct! ${currentQuestion.a} × ${currentQuestion.b} = ${correctAnswer}`,
          correctAnswer
        });
        playSound('correct');
      } else {
        setScore({ ...score, total: score.total + 1 });
        setCurrentStreak(0);

        // Update score in Firebase
        await updateSquadPlayerScore(squadCode, userName, score.correct, 0);

        setFeedback({
          show: true,
          correct: false,
          message: `${currentQuestion.a} × ${currentQuestion.b} = ${correctAnswer}`,
          correctAnswer
        });
        playSound('incorrect');
      }

      setUserAnswer('');

      setTimeout(() => {
        setFeedback({ show: false, correct: false, message: '', correctAnswer: 0 });
        generateQuestion();
      }, 1000);
    };

    const handleSquadKeyPress = (e) => {
      if (e.key === 'Enter' && userAnswer.trim()) {
        handleSquadSubmitAnswer();
      }
    };

    const handleLeaveSquadBattle = async () => {
      if (squadUnsubscribe) {
        squadUnsubscribe();
        setSquadUnsubscribe(null);
      }

      await leaveSquadBattle(squadCode, userName);

      // Reset all states
      setIsSquadBattle(false);
      setSquadCode('');
      setSquadData(null);
      setIsSquadHost(false);
      setIsPlayerReady(false);
      setPlayersReady(new Set());
      setGameActive(false);
      setTimeLeft(60);
      setScore({ correct: 0, total: 0 });
      setCurrentStreak(0);

      setGameMode('menu');
    };

    // Calculate time left based on battle type
    const getTimeLimit = () => {
      if (squadData?.battleType === 'quickClash') return 180; // 3 minutes
      return 180; // default
    };

    const getBattleTypeDisplay = () => {
      switch (squadData?.battleType) {
        case 'quickClash': return { name: 'Quick Clash', emoji: '⚡' };
        default: return { name: 'Squad Battle', emoji: '⚔️' };
      }
    };

    const getBattleTypeClass = () => {
      switch (squadData?.battleType) {
        case 'quickClash': return 'quick-clash';
        default: return '';
      }
    };

    const battleInfo = getBattleTypeDisplay();
    const battleClass = getBattleTypeClass();
    const sortedPlayers = squadData?.players
      ?.filter(p => !p.isEliminated)
      ?.sort((a, b) => b.score - a.score) || [];

    return (
      <div className="App">
        <div className="floating-ghost">👻</div>
        <div className="floating-skull">💀</div>
        <div className="floating-robot">🤖</div>
        <div className="floating-demon">👹</div>

        <div className={`game-container ${battleClass}`}>
          <div className="game-header">
            <div className="compact-game-stats">
              <span className="battle-type">{battleInfo.emoji} {battleInfo.name}</span>
              <span className="timer">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
              <span className="score">
                {score.correct}/{score.total}
                {currentStreak > 0 && <span className="streak"> 🔥{currentStreak}</span>}
              </span>
              <span className="session-indicator">{squadCode}</span>
            </div>
          </div>

          <div className="question-container">
            {feedback.show ? (
              <div className={`feedback ${feedback.correct ? 'correct' : 'incorrect'}`}>
                <div className="feedback-message">{feedback.message}</div>
              </div>
            ) : (
              <>
                <div className="question">
                  {currentQuestion.a} × {currentQuestion.b} = ?
                </div>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleSquadKeyPress}
                  className="answer-input"
                  placeholder="Your answer"
                  autoFocus
                  disabled={!gameActive || timeLeft === 0}
                />
                <button
                  onClick={handleSquadSubmitAnswer}
                  disabled={!userAnswer.trim() || !gameActive || timeLeft === 0}
                  className="submit-button"
                >
                  ⚔️ Attack!
                </button>
              </>
            )}
          </div>

          <div className="squad-leaderboard">
            <h3>Live Rankings</h3>
            <div className="live-players">
              {sortedPlayers.map((player, index) => (
                <div key={player.name} className={`live-player-item rank-${index + 1}`}>
                  <div className="rank-badge">#{index + 1}</div>
                  <div className="player-details">
                    <span className="player-name">
                      {player.isHost && '👑 '}
                      {player.name}
                      {player.name === userName && ' (You)'}
                    </span>
                    <div className="player-stats">
                      <span className="score">{player.score} points</span>
                      {player.currentStreak > 0 && (
                        <span className="streak">🔥 {player.currentStreak}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="game-controls">
            {timeLeft === 0 ? (
              <button className="mode-button results" onClick={() => setGameMode('squadResults')}>
                🏆 View Results
              </button>
            ) : (
              <button className="back-button" onClick={handleLeaveSquadBattle}>
                ← Leave Battle
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Squad Survival Mode - Last Player Standing
  if (gameMode === 'squadSurvival') {

    const handleSurvivalSubmitAnswer = async () => {
      const answer = parseInt(userAnswer);
      const correctAnswer = currentQuestion.a * currentQuestion.b;
      const isCorrect = answer === correctAnswer;

      if (isCorrect) {
        const newScore = score.correct + 1;
        const newStreak = currentStreak + 1;
        setScore({ ...score, correct: newScore, total: score.total + 1 });
        setCurrentStreak(newStreak);

        // Update score in Firebase
        await updateSquadPlayerScore(squadCode, userName, newScore, newStreak);

        setFeedback({
          show: true,
          correct: true,
          message: `Correct! ${currentQuestion.a} × ${currentQuestion.b} = ${correctAnswer}`,
          correctAnswer
        });
        playSound('correct');
      } else {
        const newLives = playerLives - 1;
        setScore({ ...score, total: score.total + 1 });
        setCurrentStreak(0);

        if (newLives <= 0) {
          // Player is eliminated
          setIsEliminated(true);
          await eliminatePlayer(squadCode, userName);
          setFeedback({
            show: true,
            correct: false,
            message: `💀 Eliminated! ${currentQuestion.a} × ${currentQuestion.b} = ${correctAnswer}`,
            correctAnswer
          });
        } else {
          setPlayerLives(newLives);
          setFeedback({
            show: true,
            correct: false,
            message: `💔 Lost a life! ${currentQuestion.a} × ${currentQuestion.b} = ${correctAnswer}. ${newLives} lives left.`,
            correctAnswer
          });
        }

        // Update score in Firebase (even if eliminated, for final standings)
        await updateSquadPlayerScore(squadCode, userName, score.correct, 0);
        playSound('incorrect');
      }

      setUserAnswer('');

      setTimeout(() => {
        setFeedback({ show: false, correct: false, message: '', correctAnswer: 0 });
        if (!isEliminated && playerLives > 0) {
          generateQuestion();
        }
      }, 2000); // Longer timeout for survival mode to read elimination messages
    };

    const handleSurvivalKeyPress = (e) => {
      if (e.key === 'Enter' && userAnswer.trim() && !isEliminated) {
        handleSurvivalSubmitAnswer();
      }
    };

    const handleLeaveSurvival = async () => {
      if (squadUnsubscribe) {
        squadUnsubscribe();
        setSquadUnsubscribe(null);
      }

      await leaveSquadBattle(squadCode, userName);

      // Reset all states
      setIsSquadBattle(false);
      setSquadCode('');
      setSquadData(null);
      setIsSquadHost(false);
      setIsPlayerReady(false);
      setPlayersReady(new Set());
      setGameActive(false);
      setTimeLeft(60);
      setScore({ correct: 0, total: 0 });
      setCurrentStreak(0);
      setPlayerLives(3);
      setIsEliminated(false);

      setGameMode('menu');
    };

    // Check if game should end (only 1 or 0 players left)
    const activePlayers = squadData?.players?.filter(p => !p.isEliminated) || [];
    const gameOver = activePlayers.length <= 1;

    const sortedPlayers = squadData?.players
      ?.sort((a, b) => {
        // Sort by: not eliminated first, then by score
        if (a.isEliminated && !b.isEliminated) return 1;
        if (!a.isEliminated && b.isEliminated) return -1;
        return b.score - a.score;
      }) || [];

    return (
      <div className="App">
        <div className="floating-ghost">👻</div>
        <div className="floating-skull">💀</div>
        <div className="floating-robot">🤖</div>
        <div className="floating-demon">👹</div>

        <div className="game-container survival-mode">
          <div className="game-header">
            <div className="compact-game-stats">
              <span className="battle-type">💀 Survival Mode</span>
              <span className="score">
                {score.correct}/{score.total}
                {currentStreak > 0 && <span className="streak"> 🔥{currentStreak}</span>}
              </span>
              <span className="session-indicator">
                {isEliminated ? '💀 Eliminated' : `❤️ ${playerLives} Lives`}
              </span>
              <span className="session-indicator">{squadCode}</span>
            </div>
          </div>

          <div className="question-container">
            {feedback.show ? (
              <div className={`feedback ${feedback.correct ? 'correct' : 'incorrect'}`}>
                <div className="feedback-message">{feedback.message}</div>
              </div>
            ) : isEliminated ? (
              <div className="feedback incorrect">
                <div className="feedback-message">💀 You've been eliminated!</div>
                <div className="correct-answer">Watch the remaining players battle it out.</div>
              </div>
            ) : gameOver ? (
              <div className="feedback correct">
                <div className="feedback-message">🏆 Survival Complete!</div>
                <div className="correct-answer">Only the strongest survived!</div>
              </div>
            ) : (
              <>
                <div className="question">
                  {currentQuestion.a} × {currentQuestion.b} = ?
                </div>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleSurvivalKeyPress}
                  className="answer-input"
                  placeholder="Your answer"
                  autoFocus
                  disabled={isEliminated || gameOver}
                />
                <button
                  onClick={handleSurvivalSubmitAnswer}
                  disabled={!userAnswer.trim() || isEliminated || gameOver}
                  className="submit-button"
                >
                  ⚔️ Attack!
                </button>
              </>
            )}
          </div>

          <div className="squad-leaderboard">
            <h3>Survival Rankings</h3>
            <div className="live-players">
              {sortedPlayers.map((player, index) => (
                <div key={player.name} className={`live-player-item rank-${index + 1} ${player.isEliminated ? 'eliminated' : ''}`}>
                  <div className={`rank-badge ${player.isEliminated ? 'eliminated' : ''}`}>
                    {player.isEliminated ? '💀' : `#${index + 1}`}
                  </div>
                  <div className="player-details">
                    <span className="player-name">
                      {player.isHost && '👑 '}
                      {player.name}
                      {player.name === userName && ' (You)'}
                      {player.isEliminated && ' - ELIMINATED'}
                    </span>
                    <div className="player-stats">
                      <span className="score">{player.score} correct</span>
                      {!player.isEliminated && player.currentStreak > 0 && (
                        <span className="streak">🔥 {player.currentStreak}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="game-controls">
            {gameOver ? (
              <button className="mode-button results" onClick={() => setGameMode('squadResults')}>
                🏆 View Results
              </button>
            ) : (
              <button className="back-button" onClick={handleLeaveSurvival}>
                ← Leave Survival
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Squad Battle Results Screen
  if (gameMode === 'squadResults') {
    const handleReturnToMenu = async () => {
      // Clean up squad battle state
      if (squadUnsubscribe) {
        squadUnsubscribe();
        setSquadUnsubscribe(null);
      }

      // Reset all squad battle states
      setIsSquadBattle(false);
      setSquadCode('');
      setSquadData(null);
      setIsSquadHost(false);
      setIsPlayerReady(false);
      setPlayersReady(new Set());
      setGameActive(false);
      setTimeLeft(60);
      setScore({ correct: 0, total: 0 });
      setCurrentStreak(0);
      setPlayerLives(3);
      setIsEliminated(false);

      setGameMode('menu');
    };

    const battleTypeDisplay = {
      quickClash: { name: 'Quick Clash', emoji: '⚡', description: '3-minute speed battle' },
      epicDuel: { name: 'Epic Duel', emoji: '🏆', description: '5-minute marathon' },
      survival: { name: 'Survival Mode', emoji: '💀', description: 'Last player standing' }
    };

    const currentBattleType = battleTypeDisplay[squadData?.battleType] || battleTypeDisplay.quickClash;

    // Sort players for final results
    const finalResults = squadData?.players?.sort((a, b) => {
      // For survival mode: not eliminated first, then by score
      if (squadData?.battleType === 'survival') {
        if (a.isEliminated && !b.isEliminated) return 1;
        if (!a.isEliminated && b.isEliminated) return -1;
      }
      // Then sort by score (highest first)
      return b.score - a.score;
    }) || [];

    const playerResult = finalResults.find(p => p.name === userName);
    const playerRank = finalResults.findIndex(p => p.name === userName) + 1;

    return (
      <div className="App">
        <div className="floating-ghost">👻</div>
        <div className="floating-skull">💀</div>
        <div className="floating-robot">🤖</div>
        <div className="floating-demon">👹</div>

        <div className="results-container">
          <div className="results-header">
            <h1>Battle Complete!</h1>
            <div className="battle-summary">
              <div className="battle-type-display">
                <span className="battle-emoji">{currentBattleType.emoji}</span>
                <div className="battle-details">
                  <h2>{currentBattleType.name}</h2>
                  <p>{currentBattleType.description}</p>
                </div>
              </div>
              <div className="session-code">Squad: {squadCode}</div>
            </div>
          </div>

          <div className="personal-result">
            <div className="result-card">
              <h2>Your Performance</h2>
              <div className="rank-display">
                <div className="rank-position">#{playerRank}</div>
                <div className="rank-text">
                  {playerRank === 1 && '🏆 Champion!'}
                  {playerRank === 2 && '🥈 Runner-up!'}
                  {playerRank === 3 && '🥉 Third place!'}
                  {playerRank > 3 && `${playerRank}th place`}
                </div>
              </div>
              <div className="personal-stats-grid">
                <div className="stat-box">
                  <div className="stat-number">{playerResult?.score || 0}</div>
                  <div className="stat-label">Correct Answers</div>
                </div>
                <div className="stat-box">
                  <div className="stat-number">{playerResult?.bestStreak || 0}</div>
                  <div className="stat-label">Best Streak</div>
                </div>
                {squadData?.battleType === 'survival' && (
                  <div className="stat-box">
                    <div className="stat-number">
                      {playerResult?.isEliminated ? '💀' : '❤️'}
                    </div>
                    <div className="stat-label">
                      {playerResult?.isEliminated ? 'Eliminated' : 'Survived'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="final-leaderboard">
            <h2>Final Rankings</h2>
            <div className="leaderboard-list">
              {finalResults.map((player, index) => (
                <div key={player.name} className={`leaderboard-item rank-${index + 1} ${player.name === userName ? 'current-player' : ''}`}>
                  <div className="rank-badge">
                    {index === 0 && '🏆'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && `#${index + 1}`}
                  </div>
                  <div className="player-info">
                    <div className="player-name">
                      {player.isHost && '👑 '}
                      {player.name}
                      {player.name === userName && ' (You)'}
                      {squadData?.battleType === 'survival' && player.isEliminated && (
                        <span className="eliminated-tag"> - Eliminated</span>
                      )}
                    </div>
                    <div className="player-results">
                      <span className="final-score">{player.score} correct</span>
                      {player.bestStreak > 0 && (
                        <span className="best-streak">🔥 {player.bestStreak} best streak</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="results-actions">
            <button className="play-again-btn" onClick={() => setGameMode('squadSelect')}>
              🔄 Play Another Battle
            </button>
            <button className="back-home-btn" onClick={handleReturnToMenu}>
              🏠 Return to Kingdom
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Create Session UI (Teacher)
  if (gameMode === 'createSession') {
    
    const handleCreateSession = async () => {
      console.log('🚀 Starting session creation...', { userName, selectedGameMode });
      setIsCreating(true);
      
      try {
        const timeLimit = selectedGameMode === 'timed' ? 60 : 60; // Both timed modes use 60 seconds
        console.log('📝 Creating session with params:', { userName, selectedGameMode, timeLimit });
        
        const result = await createSession(userName, selectedGameMode, timeLimit);
        console.log('📊 Session creation result:', result);
        
        if (result.success) {
          console.log('✅ Session created successfully:', result.code);
          setSessionCode(result.code);
          setUserRole('teacher');
          setIsMultiplayer(true);
          setGameMode('teacherLobby');
          
          // Subscribe to session updates
          console.log('👂 Setting up session listener...');
          const unsubscribe = subscribeToSession(result.code, (data) => {
            console.log('📡 Session data update:', data);
            setSessionData(data);
          });
          setSessionUnsubscribe(() => unsubscribe);
        } else {
          console.error('❌ Session creation failed:', result.error);
          showErrorMessage(`Failed to create session: ${result.error}`);
        }
      } catch (error) {
        console.error('💥 Session creation error:', error);
        showErrorMessage(`Session creation error: ${error.message}`);
      }
      
      setIsCreating(false);
      console.log('🏁 Session creation process complete');
    };

    return (
      <div className="App">
        <div className="floating-ghost">👻</div>
        <div className="floating-skull">💀</div>
        <div className="floating-robot">🤖</div>
        <div className="floating-demon">👹</div>
        <div className="menu-container">
          <h1>Create classroom session</h1>
          <p>Hello Teacher {userName}! Set up a monster math battle for your students.</p>
          
          <div className="session-setup">
            <h3>Choose battle mode:</h3>
            <div className="mode-selection">
              <label className="mode-option">
                <input
                  type="radio"
                  value="timed"
                  checked={selectedGameMode === 'timed'}
                  onChange={(e) => setSelectedGameMode(e.target.value)}
                />
                Monster Race (60 seconds)
              </label>
              <label className="mode-option">
                <input
                  type="radio"
                  value="advanced"
                  checked={selectedGameMode === 'advanced'}
                  onChange={(e) => setSelectedGameMode(e.target.value)}
                />
                Boss Monster Battle (60 seconds)
              </label>
            </div>
          </div>
          
          <div className="menu-buttons">
            <button 
              className="mode-button teacher" 
              onClick={handleCreateSession}
              disabled={isCreating}
            >
              {isCreating ? '🔄 Creating...' : '🚀 Create session'}
            </button>
            <button className="mode-button back" onClick={() => setGameMode('multiplayerSelect')}>
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Join Session UI (Student)
  if (gameMode === 'joinSession') {
    
    const handleJoinSession = async () => {
      if (!inputCode.trim() || inputCode.length !== 4) {
        showErrorMessage('Please enter a valid 4-character session code');
        return;
      }
      
      setIsJoining(true);
      const result = await joinSession(inputCode.toUpperCase(), userName);
      
      if (result.success) {
        setSessionCode(inputCode.toUpperCase());
        setUserRole('student');
        setIsMultiplayer(true);
        setGameMode('studentLobby');
        
        // Subscribe to session updates
        const unsubscribe = subscribeToSession(inputCode.toUpperCase(), (data) => {
          if (!data) {
            // Session was deleted by teacher
            showErrorMessage('The battle has been ended by your teacher.');
            setTimeout(async () => {
              await cleanupMultiplayerState();
              setGameMode('menu');
            }, 3000);
            return;
          }
          
          setSessionData(data);
          // Auto-start game when teacher starts it - use callback to get current state
          setHasStartedSession(currentHasStarted => {
            console.log('📡 Session data update:', { 
              hasStartedAt: !!data?.startedAt, 
              currentHasStarted,
              studentsCount: data?.students?.length 
            });
            
            if (data && data.startedAt && !currentHasStarted) {
              console.log('🎮 Teacher started the game! Auto-starting for student...');
              
              // Clear any pending question timeouts
              if (questionTimeoutRef.current) {
                clearTimeout(questionTimeoutRef.current);
                questionTimeoutRef.current = null;
              }
              
              const selectedMode = data.gameMode || 'timed';
              // Timer will be calculated from server timestamp in useEffect
              setPreviousGameMode(selectedMode);
              setGameMode(selectedMode);
              
              // Start countdown for multiplayer students
              startCountdown(() => {
                setGameActive(true);
                generateQuestion();
              });
              // Note: Don't restart background music here as it should already be playing
              return true; // Set hasStartedSession to true
            }
            return currentHasStarted; // Keep current value
          });
        });
        setSessionUnsubscribe(() => unsubscribe);
      } else {
        showErrorMessage(`Failed to join session: ${result.error}`);
      }
      setIsJoining(false);
    };

    return (
      <div className="App">
        <div className="floating-ghost">👻</div>
        <div className="floating-skull">💀</div>
        <div className="floating-robot">🤖</div>
        <div className="floating-demon">👹</div>
        <div className="menu-container">
          <h1>Join classroom session</h1>
          <p>Hi {userName}! Enter the session code your teacher gave you.</p>
          
          <div className="session-join">
            <label htmlFor="session-code">Session Code:</label>
            <input
              id="session-code"
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleJoinSession()}
              className="session-code-input"
              placeholder="ABCD"
              maxLength={4}
              autoFocus
            />
          </div>
          
          <div className="menu-buttons">
            <button 
              className="mode-button student" 
              onClick={handleJoinSession}
              disabled={isJoining || !inputCode.trim() || inputCode.length !== 4}
            >
              {isJoining ? '🔄 Joining...' : '🎒 Join battle!'}
            </button>
            <button className="mode-button back" onClick={async () => {
              // Clean up any partial multiplayer state
              await cleanupMultiplayerState();
              setGameMode('multiplayerSelect');
            }}>
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Teacher Lobby
  if (gameMode === 'teacherLobby') {
    const handleStartGame = async () => {
      const success = await startSession(sessionCode);
      if (success && sessionData) {
        console.log('🍎 Teacher started the game! Switching to monitor view...');
        const selectedMode = sessionData.gameMode || 'timed';
        // Timer will be calculated from server timestamp in useEffect
        setGameActive(true); // Start timer countdown
        setGameMode('teacherMonitor'); // Teacher doesn't play, just monitors
      }
    };

    return (
      <div className="App">
        <div className="floating-ghost">👻</div>
        <div className="floating-skull">💀</div>
        <div className="floating-robot">🤖</div>
        <div className="floating-demon">👹</div>
        <div className="menu-container">
          <h1>Classroom lobby</h1>
          <div className="session-info">
            <h2>Session Code: <span className="session-code-display">{sessionCode}</span></h2>
            <p>Share this code with your students!</p>
          </div>
          
          <div className="students-list">
            <h3>Students Joined ({sessionData?.students?.length || 0}):</h3>
            <div className="students-grid">
              {sessionData?.students?.map((student, index) => (
                <div key={index} className="student-card">
                  <span className="student-name">{student.name}</span>
                  <span className="student-status">Ready!</span>
                </div>
              ))}
              {(!sessionData?.students || sessionData.students.length === 0) && (
                <p className="no-students">Waiting for students to join...</p>
              )}
            </div>
          </div>
          
          <div className="menu-buttons">
            <button 
              className="mode-button teacher" 
              onClick={handleStartGame}
              disabled={!sessionData?.students || sessionData.students.length === 0}
            >
              🚀 Start battle!
            </button>
            <button className="mode-button back" onClick={() => {
              if (sessionUnsubscribe) sessionUnsubscribe();
              setGameMode('menu');
              setIsMultiplayer(false);
            }}>
              ← Cancel Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Student Lobby
  if (gameMode === 'studentLobby') {
    return (
      <div className="App">
        <div className="floating-ghost">👻</div>
        <div className="floating-skull">💀</div>
        <div className="floating-robot">🤖</div>
        <div className="floating-demon">👹</div>
        <div className="menu-container">
          <h1>Waiting for battle</h1>
          <div className="session-info">
            <h2>Session: {sessionCode}</h2>
            <p>Teacher: {sessionData?.teacherName}</p>
            <p>Mode: {sessionData?.gameMode === 'timed' ? 'Monster Race (60s)' : 'Boss Battle (60s)'}</p>
          </div>
          
          <div className="students-list">
            <h3>👥 Fellow Warriors ({sessionData?.students?.length || 0}):</h3>
            <div className="students-grid">
              {sessionData?.students?.map((student, index) => (
                <div key={index} className="student-card">
                  <span className="student-name">{student.name}</span>
                  <span className="student-status">Ready!</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="waiting-message">
            <p>Waiting for your teacher to start the battle...</p>
          </div>
          
          <div className="menu-buttons">
            <button className="mode-button back" onClick={async () => {
              await cleanupMultiplayerState();
              setGameMode('menu');
            }}>
              ← Leave Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Teacher Monitor View (during active game)
  if (gameMode === 'teacherMonitor') {
    const gameTimeLeft = Math.max(0, timeLeft);
    const isGameFinished = timeLeft <= 0;
    
    return (
      <div className="App">
        <div className="floating-ghost">👻</div>
        <div className="floating-skull">💀</div>
        <div className="floating-robot">🤖</div>
        <div className="floating-demon">👹</div>
        <div className="menu-container">
          <h1>🍎 Battle monitor</h1>
          <div className="session-info">
            <h2>Session: {sessionCode}</h2>
            <p>Mode: {sessionData?.gameMode === 'timed' ? 'Monster Race (60s)' : 'Boss Battle (60s)'}</p>
            {!isGameFinished ? (
              <div className="timer-display">
                <h2>⏰ Time Remaining: {gameTimeLeft}s</h2>
              </div>
            ) : (
              <div className="game-finished">
                <h2>🏁 Battle Complete!</h2>
              </div>
            )}
          </div>
          
          <div className="live-leaderboard-monitor">
            <h3>📊 Live Battle Progress</h3>
            <div className="leaderboard-grid">
              {sessionData?.students
                ?.sort((a, b) => {
                  // Sort by correct answers, then by total attempts
                  if (b.score.correct !== a.score.correct) {
                    return b.score.correct - a.score.correct;
                  }
                  return b.score.total - a.score.total;
                })
                .map((student, index) => {
                  const percentage = student.score.total > 0 ? Math.round((student.score.correct / student.score.total) * 100) : 0;
                  return (
                    <div key={student.name} className={`leaderboard-entry-monitor ${index < 3 ? 'top-three' : ''}`}>
                      <div className="rank">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>
                      <div className="player-info-monitor">
                        <span className="player-name">{student.name}</span>
                        <div className="player-stats-monitor">
                          <span className="score-display">{student.score.correct}/{student.score.total}</span>
                          <span className="percentage-display">{percentage}%</span>
                          {student.bestStreak > 0 && (
                            <span className="streak-display">{student.bestStreak} streak</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </div>
          
          <div className="menu-buttons">
            {isGameFinished ? (
              <>
                <button 
                  className="mode-button teacher" 
                  onClick={() => setGameMode('multiplayerResults')}
                >
                  📊 View Final Results
                </button>
                <button 
                  className="mode-button back" 
                  onClick={async () => {
                    await cleanupMultiplayerState();
                    setGameMode('menu');
                    setGameActive(false);
                    setScore({ correct: 0, total: 0 });
                    setTimeLeft(60);
                    setUserAnswer('');
                    setFeedback({ show: false, correct: false, message: '', correctAnswer: 0 });
                  }}
                >
                  🏠 Back to menu
                </button>
              </>
            ) : (
              <button 
                className="mode-button danger" 
                onClick={() => {
                  showConfirmDialog(
                    'Are you sure you want to end this battle for all students? This action cannot be undone.',
                    () => {
                      setGameActive(false);
                      setTimeLeft(0);
                      // This will trigger the isGameFinished state
                    }
                  );
                }}
              >
                🛑 End battle now
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Multiplayer Final Results
  if (gameMode === 'multiplayerResults') {
    const sortedStudents = sessionData?.students
      ?.map(student => {
        const percentage = student.score.total > 0 ? (student.score.correct / student.score.total) * 100 : 0;
        return {
          ...student,
          percentage,
          // Combined score: percentage * 0.7 + attempts * 0.3 (weighted towards accuracy)
          combinedScore: percentage * 0.7 + (student.score.total * 3)
        };
      })
      .sort((a, b) => {
        // Primary sort: percentage
        if (Math.abs(b.percentage - a.percentage) > 0.1) {
          return b.percentage - a.percentage;
        }
        // Secondary sort: total attempts
        return b.score.total - a.score.total;
      }) || [];
    
    const winner = sortedStudents[0];
    
    return (
      <div className="App">
        <div className="floating-ghost">👻</div>
        <div className="floating-skull">💀</div>
        <div className="floating-robot">🤖</div>
        <div className="floating-demon">👹</div>
        <div className="results-container">
          <h1>Battle results</h1>
          
          {winner && (
            <div className="winner-announcement">
              <h2>Champion: {winner.name}!</h2>
              <p>Accuracy: {Math.round(winner.percentage)}% | Battles: {winner.score.correct}/{winner.score.total}</p>
            </div>
          )}
          
          <div className="final-leaderboard">
            <h3>Final Rankings</h3>
            <div className="final-results-grid">
              {sortedStudents.map((student, index) => (
                <div key={student.name} className={`final-result-entry ${index === 0 ? 'winner' : index < 3 ? 'podium' : ''}`}>
                  <div className="final-rank">
                    {index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </div>
                  <div className="final-player-info">
                    <h4>{student.name}</h4>
                    <div className="final-stats">
                      <div className="stat-item">
                        <span className="stat-label">Accuracy:</span>
                        <span className="stat-value">{Math.round(student.percentage)}%</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Monsters Defeated:</span>
                        <span className="stat-value">{student.score.correct}/{student.score.total}</span>
                      </div>
                      {student.bestStreak > 0 && (
                        <div className="stat-item">
                          <span className="stat-label">Best Streak:</span>
                          <span className="stat-value">{student.bestStreak}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="menu-buttons">
            {userRole === 'teacher' && (
              <button 
                className="mode-button teacher" 
                onClick={() => setGameMode('teacherLobby')}
              >
                🔄 New Battle
              </button>
            )}
            <button 
              className="mode-button back" 
              onClick={async () => {
                await cleanupMultiplayerState();
                setGameMode('menu');
                setGameActive(false);
                setScore({ correct: 0, total: 0 });
                setTimeLeft(60);
                setUserAnswer('');
                setFeedback({ show: false, correct: false, message: '', correctAnswer: 0 });
              }}
            >
              🏠 Back to menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Changelog screen
  if (gameMode === 'changelog') {
    return (
      <div className="App">
        <div className="floating-ghost">👻</div>
        <div className="floating-skull">💀</div>
        <div className="floating-robot">🤖</div>
        <div className="floating-demon">👹</div>
        <div className="menu-container">
          <h1>Version history</h1>
          <div className="changelog-container">
            {CHANGELOG.map((release) => (
              <div key={release.version} className="changelog-entry">
                <div className="changelog-header">
                  <h3 className="changelog-version">{release.version}</h3>
                  <span className="changelog-date">{release.date}</span>
                </div>
                <ul className="changelog-features">
                  {release.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="menu-buttons">
            <button className="mode-button back" onClick={() => setGameMode('menu')}>
              ← Back to menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameMode === 'results') {
    const percentage = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    const currentModeHistory = previousGameMode === 'unlimited' ? [] : scoreHistory[previousGameMode === 'timed' ? 'timed' : 'advanced'];
    const showHistory = currentModeHistory.length > 0;
    
    return (
      <div className="App">
        <div className="floating-ghost">👻</div>
        <div className="floating-skull">💀</div>
        <div className="floating-robot">🤖</div>
        <div className="floating-demon">👹</div>
        <div className="results-container">
          <h1>Monster master {userName}!</h1>
          
          <div className="current-results">
            <h2>This Monster Battle</h2>
            <div className="results">
              <div className="result-item">
                <span className="result-label">Monsters Encountered:</span>
                <span className="result-value">{score.total}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Monsters Defeated:</span>
                <span className="result-value">{score.correct}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Battle Success Rate:</span>
                <span className="result-value">{percentage}%</span>
              </div>
            </div>
          </div>

          {showHistory && (
            <div className="score-history">
              <div className="history-header">
                <h2>Monster Hunting Progress</h2>
                <button 
                  className="clear-history-button" 
                  onClick={() => clearHistory(previousGameMode === 'timed' ? 'timed' : 'advanced')}
                  title="Clear history"
                >
                  🗑️
                </button>
              </div>
              <div className="history-list">
                {currentModeHistory.slice(-5).reverse().map((entry, index) => (
                  <div key={index} className="history-item">
                    <div className="history-main">
                      <span className="history-score">{entry.correct}/{entry.attempts}</span>
                      <span className="history-percentage">{entry.percentage}%</span>
                    </div>
                    <div className="history-date">{entry.date} at {entry.time}</div>
                  </div>
                ))}
                {currentModeHistory.length > 5 && (
                  <div className="history-more">
                    ... and {currentModeHistory.length - 5} more attempts
                  </div>
                )}
              </div>
            </div>
          )}

          <button className="back-button" onClick={backToMenu}>
            🏠 Return to monster kingdom
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="floating-ghost">👻</div>
      <div className="floating-skull">💀</div>
      <div className="floating-robot">🤖</div>
      <div className="floating-demon">👹</div>
      
      {/* Countdown Overlay */}
      {isCountingDown && (
        <div className="countdown-overlay">
          <div className="countdown-display">
            <h2>🏁 Get Ready!</h2>
            <div className="countdown-number">{countdown}</div>
          </div>
        </div>
      )}

      {/* Error Message Overlay */}
      {showError && (
        <div className="error-overlay" onClick={hideErrorMessage}>
          <div className="error-message" onClick={(e) => e.stopPropagation()}>
            <div className="error-icon">!</div>
            <div className="error-text">{errorMessage}</div>
            <button className="error-close-button" onClick={hideErrorMessage}>
              ✕ Close
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Overlay */}
      {showConfirm && (
        <div className="error-overlay" onClick={hideConfirmDialog}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">❓</div>
            <div className="confirm-text">{confirmMessage}</div>
            <div className="confirm-buttons">
              <button className="confirm-button confirm-yes" onClick={handleConfirm}>
                ✓ Yes
              </button>
              <button className="confirm-button confirm-no" onClick={hideConfirmDialog}>
                ✕ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {gameMode === 'detective' ? (
        <div className="detective-container">
          <div className="game-header">
            <div className="compact-game-stats">
              <span className="detective-progress">
                Case {detectiveQuestionCount} of {detectiveMaxQuestions}
              </span>
            </div>
          </div>

          <div className="detective-clue-container">
            {!feedback.show && (
              <div className="detective-clue">
                {detectiveClue.clue}
              </div>
            )}

            {feedback.show && (
              <div className={`feedback ${feedback.correct ? 'correct' : 'incorrect'}`}>
                <div className="feedback-message">{feedback.message}</div>
                {!feedback.correct && (
                  <>
                    <div className="correct-answer">
                      The correct answer is {feedback.correctAnswer}
                    </div>
                    <button
                      onClick={moveToNextDetectiveQuestion}
                      className="submit-button detective-submit next-question-btn"
                      style={{ marginTop: '15px' }}
                    >
                      📖 Next Question
                    </button>
                  </>
                )}
              </div>
            )}

            {!feedback.show && (
              <div className="detective-inputs">
                <div className="factor-inputs">
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={detectiveClue.prefilledPosition === 1 ? detectiveClue.prefilledFactor : detectiveInput.factor1}
                    onChange={(e) => {
                      if (detectiveClue.prefilledPosition !== 1) {
                        setDetectiveInput(prev => ({ ...prev, factor1: e.target.value }));
                      }
                    }}
                    className={`detective-input ${detectiveClue.prefilledPosition === 1 ? 'prefilled' : ''}`}
                    placeholder="First number"
                    min="0"
                    max="12"
                    readOnly={detectiveClue.prefilledPosition === 1}
                  />
                  <span className="multiplication-symbol">×</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={detectiveClue.prefilledPosition === 2 ? detectiveClue.prefilledFactor : detectiveInput.factor2}
                    onChange={(e) => {
                      if (detectiveClue.prefilledPosition !== 2) {
                        setDetectiveInput(prev => ({ ...prev, factor2: e.target.value }));
                      }
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && submitDetectiveAnswer()}
                    className={`detective-input ${detectiveClue.prefilledPosition === 2 ? 'prefilled' : ''}`}
                    placeholder="Second number"
                    min="0"
                    max="12"
                    readOnly={detectiveClue.prefilledPosition === 2}
                  />
                </div>
                <button
                  onClick={submitDetectiveAnswer}
                  className="submit-button detective-submit"
                  disabled={
                    detectiveClue.type === 'divisionPrep'
                      ? (detectiveClue.prefilledPosition === 1 ? !detectiveInput.factor2 : !detectiveInput.factor1)
                      : (!detectiveInput.factor1 || !detectiveInput.factor2)
                  }
                >
                  🔍 Solve case!
                </button>
              </div>
            )}
          </div>

          <div className="game-controls">
            <button onClick={endGame} className="done-button">
              🎆 Close detective agency!
            </button>
            <button onClick={backToMenu} className="back-button">
              🏠 Return to kingdom
            </button>
          </div>
        </div>
      ) : gameMode === 'twoDigit' ? (
        <div className="twodigit-container">
          <div className="game-header">
            <div className="compact-game-stats">
              <span className="twodigit-progress">
                Question {twoDigitQuestionCount} of {twoDigitMaxQuestions}
              </span>
              <span className="score">
                {score.correct}/{score.total}
              </span>
            </div>
          </div>

          <div className="twodigit-question-container">
            {!feedback.show && (
              <div className="vertical-multiplication-work">
                <div className="work-area">
                  {/* Multiplication carry digits - stacked vertically above tens place */}
                  <div className="carry-column">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      className="carry-input"
                      value={twoDigitWork.carry2}
                      onChange={(e) => setTwoDigitWork(prev => ({ ...prev, carry2: e.target.value.replace(/\D/g, '') }))}
                      placeholder=" "
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      className="carry-input"
                      value={twoDigitWork.carry1}
                      onChange={(e) => setTwoDigitWork(prev => ({ ...prev, carry1: e.target.value.replace(/\D/g, '') }))}
                      placeholder=" "
                    />
                  </div>

                  {/* Multiplicand (top number) */}
                  <div className="multiplicand-row">
                    <div className="carry-space"></div>
                    <div className="carry-space"></div>
                    <div className="carry-space"></div>
                    <div className="digit-display">{Math.floor(currentQuestion.a / 10)}</div>
                    <div className="digit-display">{currentQuestion.a % 10}</div>
                  </div>

                  {/* Multiplier (bottom number with × symbol) */}
                  <div className="multiplier-row">
                    <div className="carry-space"></div>
                    <div className="carry-space"></div>
                    <span className="times-symbol-work">×</span>
                    <div className="digit-display">{Math.floor(currentQuestion.b / 10)}</div>
                    <div className="digit-display">{currentQuestion.b % 10}</div>
                  </div>

                  {/* Horizontal line */}
                  <div className="work-line"></div>

                  {/* Addition carry digits - horizontally above first partial product */}
                  <div className="addition-carry-row">
                    <div className="carry-space"></div>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      className="carry-input small"
                      value={twoDigitWork.addCarry3}
                      onChange={(e) => setTwoDigitWork(prev => ({ ...prev, addCarry3: e.target.value.replace(/\D/g, '') }))}
                      placeholder=" "
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      className="carry-input small"
                      value={twoDigitWork.addCarry2}
                      onChange={(e) => setTwoDigitWork(prev => ({ ...prev, addCarry2: e.target.value.replace(/\D/g, '') }))}
                      placeholder=" "
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      className="carry-input small"
                      value={twoDigitWork.addCarry1}
                      onChange={(e) => setTwoDigitWork(prev => ({ ...prev, addCarry1: e.target.value.replace(/\D/g, '') }))}
                      placeholder=" "
                    />
                    <div className="carry-space"></div>
                  </div>

                  {/* First partial product row */}
                  <div className="partial-product-row">
                    <div className="carry-space"></div>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      className="digit-input"
                      value={twoDigitWork.row1.thousands}
                      onChange={(e) => setTwoDigitWork(prev => ({ ...prev, row1: { ...prev.row1, thousands: e.target.value.replace(/\D/g, '') } }))}
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      className="digit-input"
                      value={twoDigitWork.row1.hundreds}
                      onChange={(e) => setTwoDigitWork(prev => ({ ...prev, row1: { ...prev.row1, hundreds: e.target.value.replace(/\D/g, '') } }))}
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      className="digit-input"
                      value={twoDigitWork.row1.tens}
                      onChange={(e) => setTwoDigitWork(prev => ({ ...prev, row1: { ...prev.row1, tens: e.target.value.replace(/\D/g, '') } }))}
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      className="digit-input"
                      value={twoDigitWork.row1.ones}
                      onChange={(e) => setTwoDigitWork(prev => ({ ...prev, row1: { ...prev.row1, ones: e.target.value.replace(/\D/g, '') } }))}
                    />
                  </div>

                  {/* Second partial product row (with placeholder 0) */}
                  <div className="partial-product-row">
                    <div className="carry-space"></div>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      className="digit-input"
                      value={twoDigitWork.row2.thousands}
                      onChange={(e) => setTwoDigitWork(prev => ({ ...prev, row2: { ...prev.row2, thousands: e.target.value.replace(/\D/g, '') } }))}
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      className="digit-input"
                      value={twoDigitWork.row2.hundreds}
                      onChange={(e) => setTwoDigitWork(prev => ({ ...prev, row2: { ...prev.row2, hundreds: e.target.value.replace(/\D/g, '') } }))}
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      className="digit-input"
                      value={twoDigitWork.row2.tens}
                      onChange={(e) => setTwoDigitWork(prev => ({ ...prev, row2: { ...prev.row2, tens: e.target.value.replace(/\D/g, '') } }))}
                    />
                    <div className="digit-display placeholder-zero">0</div>
                  </div>

                  {/* Addition line */}
                  <div className="work-line"></div>

                  {/* Sum row */}
                  <div className="sum-row">
                    <div className="carry-space"></div>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      className="digit-input"
                      value={twoDigitWork.sum.thousands}
                      onChange={(e) => setTwoDigitWork(prev => ({ ...prev, sum: { ...prev.sum, thousands: e.target.value.replace(/\D/g, '') } }))}
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      className="digit-input"
                      value={twoDigitWork.sum.hundreds}
                      onChange={(e) => setTwoDigitWork(prev => ({ ...prev, sum: { ...prev.sum, hundreds: e.target.value.replace(/\D/g, '') } }))}
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      className="digit-input"
                      value={twoDigitWork.sum.tens}
                      onChange={(e) => setTwoDigitWork(prev => ({ ...prev, sum: { ...prev.sum, tens: e.target.value.replace(/\D/g, '') } }))}
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      className="digit-input"
                      value={twoDigitWork.sum.ones}
                      onChange={(e) => setTwoDigitWork(prev => ({ ...prev, sum: { ...prev.sum, ones: e.target.value.replace(/\D/g, '') } }))}
                    />
                  </div>
                </div>

                <button
                  onClick={submitTwoDigitAnswer}
                  className="submit-button twodigit-submit"
                  style={{ marginTop: '20px' }}
                >
                  Check Answer
                </button>
              </div>
            )}

            {feedback.show && (
              <div className={`feedback ${feedback.correct ? 'correct' : 'incorrect'}`}>
                <div className="feedback-message">{feedback.message}</div>
                {!feedback.correct && (
                  <div className="twodigit-feedback-buttons">
                    <button
                      onClick={retryTwoDigitQuestion}
                      className="submit-button retry-button"
                      style={{ marginTop: '15px', marginRight: '10px' }}
                    >
                      🔄 Try Again
                    </button>
                    <button
                      onClick={moveToNextTwoDigitQuestion}
                      className="submit-button next-button"
                      style={{ marginTop: '15px' }}
                    >
                      ➡️ Next Question
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="game-controls">
            <button onClick={endGame} className="done-button">
              Done
            </button>
            <button onClick={backToMenu} className="back-button">
              Back to Menu
            </button>
          </div>
        </div>
      ) : (
        <div className="game-container">
          <div className="game-header">
            <div className="compact-game-stats">
              {(gameMode === 'timed' || gameMode === 'advanced') && (
                <span className="timer">{timeLeft}s</span>
              )}
              <span className="score">
                {score.correct}/{score.total}
                {isMultiplayer && currentStreak > 0 && (
                  <span className="streak"> {currentStreak} streak</span>
                )}
              </span>
              {isMultiplayer && (
                <span className="session-indicator">{sessionCode}</span>
              )}
            </div>
          </div>
          

          <div className="question-container">
            {/* In multiplayer, only show question when feedback is not showing */}
            {(!isMultiplayer || (isMultiplayer && !feedback.show)) && (
              <div className="question">
                {currentQuestion.a} × {currentQuestion.b} = ?
              </div>
            )}
            
            {feedback.show && (
              <div className={`feedback ${feedback.correct ? 'correct' : 'incorrect'}`}>
                <div className="feedback-message">{feedback.message}</div>
                {!feedback.correct && (
                  <div className="correct-answer">
                    The correct answer is {feedback.correctAnswer}
                  </div>
                )}
              </div>
            )}
            
            {!feedback.show && (
              <>
                <input
                  ref={answerInputRef}
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="answer-input"
                  placeholder="Your answer"
                  autoFocus
                />
                <button onClick={submitAnswer} className="submit-button">
                  Attack Monster!
                </button>
              </>
            )}
          </div>

          <div className="game-controls">
            {gameMode === 'unlimited' && (
              <button onClick={endGame} className="done-button">
                Victory Celebration!
              </button>
            )}
            <button onClick={backToMenu} className="back-button">
              🏠 Return to kingdom
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </Router>
  );
}

export default App;
