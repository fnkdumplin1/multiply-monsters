import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import { 
  createSession, 
  joinSession, 
  leaveSession,
  updateStudentScore, 
  startSession, 
  subscribeToSession 
} from './multiplayerUtils';

function App() {
  const [gameMode, setGameMode] = useState('nameInput');
  const [userName, setUserName] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState({ a: 0, b: 0 });
  const [userAnswer, setUserAnswer] = useState('');
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
  
  // Audio initialization state for Safari
  const [audioInitialized, setAudioInitialized] = useState(false);

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

  const handleNameSubmit = () => {
    if (userName.trim()) {
      initializeAudio(); // Initialize audio on first interaction
      playSound('click');
      trackEvent('user_registered', 'Engagement', 'Name Entered');
      setGameMode('menu');
    }
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
        generateQuestion();
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
            } else {
              endGame();
            }
          }
        }, 1000);
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
          <p>🌟 Welcome to the monster math kingdom! Let's multiply with monsters! 🌟</p>
          <div className="name-input-container">
            <label htmlFor="name-input">👋 What's your monster name? 👋</label>
            <input
              id="name-input"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyPress={handleNameKeyPress}
              className="name-input"
              placeholder="Enter your monster name"
              autoFocus
              maxLength={20}
            />
            <button 
              onClick={handleNameSubmit} 
              className="submit-button"
              disabled={!userName.trim()}
            >
              🚀 Enter the Monster Kingdom!
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
          <p>🎉 Hi {userName}! Ready to battle math monsters and become a multiplication master? 🦸‍♂️</p>
          <div className="menu-buttons">
            <button className="mode-button" onClick={startUnlimited}>
              🐉 Monster Training Mode
              <span className="mode-description">Train with friendly monsters (facts up to 12)</span>
            </button>
            <button className="mode-button" onClick={startTimed}>
              ⏱️ Monster Race (60s)
              <span className="mode-description">Race against time with speedy monsters!</span>
            </button>
            <button className="mode-button advanced" onClick={startAdvanced}>
              👺 Boss Monster Battle (60s)
              <span className="mode-description">Fight the ultimate math boss monsters!</span>
            </button>
            <button className="mode-button multiplayer" onClick={() => setGameMode('multiplayerSelect')}>
              👥 Classroom Battle Mode
              <span className="mode-description">Join or create a classroom session!</span>
            </button>
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
          <h1>Classroom Battle Mode</h1>
          <p>🏫 Join your classmates in an epic monster math battle! 🎓</p>
          <p><a href="./Multiplication Trainer - Battle Mode Teacher Guide.pdf" target="_blank" rel="noopener noreferrer">📖 Teacher Guide: How to Use Battle Mode in Your Classroom</a></p>
          <div className="menu-buttons">
            <button className="mode-button teacher" onClick={() => setGameMode('createSession')}>
              🍎 Create Classroom Session
              <span className="mode-description">Teachers: Start a new math battle for your students!</span>
            </button>
            <button className="mode-button student" onClick={() => setGameMode('joinSession')}>
              🎒 Join Classroom Session
              <span className="mode-description">Students: Enter a session code to join the battle!</span>
            </button>
            <button className="mode-button back" onClick={() => setGameMode('menu')}>
              ← Back to Menu
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
          <h1>Create Classroom Session</h1>
          <p>🍎 Hello Teacher {userName}! Set up a monster math battle for your students.</p>
          
          <div className="session-setup">
            <h3>Choose Battle Mode:</h3>
            <div className="mode-selection">
              <label className="mode-option">
                <input
                  type="radio"
                  value="timed"
                  checked={selectedGameMode === 'timed'}
                  onChange={(e) => setSelectedGameMode(e.target.value)}
                />
                ⏱️ Monster Race (60 seconds)
              </label>
              <label className="mode-option">
                <input
                  type="radio"
                  value="advanced"
                  checked={selectedGameMode === 'advanced'}
                  onChange={(e) => setSelectedGameMode(e.target.value)}
                />
                👺 Boss Monster Battle (60 seconds)
              </label>
            </div>
          </div>
          
          <div className="menu-buttons">
            <button 
              className="mode-button teacher" 
              onClick={handleCreateSession}
              disabled={isCreating}
            >
              {isCreating ? '🔄 Creating...' : '🚀 Create Session'}
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
          <h1>Join Classroom Session</h1>
          <p>🎒 Hi {userName}! Enter the session code your teacher gave you.</p>
          
          <div className="session-join">
            <label htmlFor="session-code">📝 Session Code:</label>
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
              {isJoining ? '🔄 Joining...' : '🎒 Join Battle!'}
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
          <h1>Classroom Lobby</h1>
          <div className="session-info">
            <h2>📋 Session Code: <span className="session-code-display">{sessionCode}</span></h2>
            <p>Share this code with your students!</p>
          </div>
          
          <div className="students-list">
            <h3>👥 Students Joined ({sessionData?.students?.length || 0}):</h3>
            <div className="students-grid">
              {sessionData?.students?.map((student, index) => (
                <div key={index} className="student-card">
                  <span className="student-name">🎒 {student.name}</span>
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
              🚀 Start Battle!
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
          <h1>Waiting for Battle</h1>
          <div className="session-info">
            <h2>📋 Session: {sessionCode}</h2>
            <p>🍎 Teacher: {sessionData?.teacherName}</p>
            <p>⚔️ Mode: {sessionData?.gameMode === 'timed' ? 'Monster Race (60s)' : 'Boss Battle (60s)'}</p>
          </div>
          
          <div className="students-list">
            <h3>👥 Fellow Warriors ({sessionData?.students?.length || 0}):</h3>
            <div className="students-grid">
              {sessionData?.students?.map((student, index) => (
                <div key={index} className="student-card">
                  <span className="student-name">🎒 {student.name}</span>
                  <span className="student-status">Ready!</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="waiting-message">
            <p>⏳ Waiting for your teacher to start the battle...</p>
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
          <h1>🍎 Battle Monitor</h1>
          <div className="session-info">
            <h2>📋 Session: {sessionCode}</h2>
            <p>⚔️ Mode: {sessionData?.gameMode === 'timed' ? 'Monster Race (60s)' : 'Boss Battle (60s)'}</p>
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
                            <span className="streak-display">🔥{student.bestStreak}</span>
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
                  🏠 Back to Menu
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
                🛑 End Battle Now
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
          <h1>🏆 Battle Results</h1>
          
          {winner && (
            <div className="winner-announcement">
              <h2>🎉 Champion: {winner.name}! 🎉</h2>
              <p>🎯 Accuracy: {Math.round(winner.percentage)}% | ⚔️ Battles: {winner.score.correct}/{winner.score.total}</p>
            </div>
          )}
          
          <div className="final-leaderboard">
            <h3>📋 Final Rankings</h3>
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
                          <span className="stat-value">🔥{student.bestStreak}</span>
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
              🏠 Back to Menu
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
          <h1>Monster Master {userName}!</h1>
          
          <div className="current-results">
            <h2>🎮 This Monster Battle</h2>
            <div className="results">
              <div className="result-item">
                <span className="result-label">👾 Monsters Encountered:</span>
                <span className="result-value">{score.total}</span>
              </div>
              <div className="result-item">
                <span className="result-label">🏆 Monsters Defeated:</span>
                <span className="result-value">{score.correct}</span>
              </div>
              <div className="result-item">
                <span className="result-label">⚔️ Battle Success Rate:</span>
                <span className="result-value">{percentage}%</span>
              </div>
            </div>
          </div>

          {showHistory && (
            <div className="score-history">
              <div className="history-header">
                <h2>📈 Monster Hunting Progress</h2>
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
            🏠 Return to Monster Kingdom
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
            <div className="error-icon">⚠️</div>
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
      
      <div className="game-container">
        <div className="game-header">
          <div className="compact-game-stats">
            {(gameMode === 'timed' || gameMode === 'advanced') && (
              <span className="timer">⏳ {timeLeft}s</span>
            )}
            <span className="score">
              🏆 {score.correct}/{score.total}
              {isMultiplayer && currentStreak > 0 && (
                <span className="streak"> 🔥{currentStreak}</span>
              )}
            </span>
            {isMultiplayer && (
              <span className="session-indicator">📋 {sessionCode}</span>
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
                ⚔️ Attack Monster!
              </button>
            </>
          )}
        </div>

        <div className="game-controls">
          {gameMode === 'unlimited' && (
            <button onClick={endGame} className="done-button">
              🎆 Victory Celebration!
            </button>
          )}
          <button onClick={backToMenu} className="back-button">
            🏠 Return to Kingdom
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
