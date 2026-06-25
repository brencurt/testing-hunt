import { useState, useCallback } from 'react';

const STORAGE_KEY = 'hunt_session';
const SESSION_VERSION = 1;

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    // If the data model changed, reset rather than crash
    if (session.version !== SESSION_VERSION) return null;
    return session;
  } catch {
    return null;
  }
}

function buildInitialSession() {
  return {
    version: SESSION_VERSION,
    currentStopIndex: null, // null = not started yet (on welcome screen)
    unlockedStops: [],
    stopProgress: {},
    startedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  };
}

export function useGameSession() {
  const [session, setSession] = useState(() => loadSession() || buildInitialSession());

  const save = useCallback((updates) => {
    setSession((prev) => {
      const next = { ...prev, ...updates, lastUpdated: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // Called when a QR code unlocks a new stop
  const unlockStop = useCallback((stopIndex) => {
    setSession((prev) => {
      const unlocked = prev.unlockedStops.includes(stopIndex)
        ? prev.unlockedStops
        : [...prev.unlockedStops, stopIndex];

      const next = {
        ...prev,
        currentStopIndex: stopIndex,
        unlockedStops: unlocked,
        stopProgress: {
          ...prev.stopProgress,
          [stopIndex]: prev.stopProgress[stopIndex] || {
            zoomLevel: 0,
            answeredQuestions: [],
            hintRevealed: false,
          },
        },
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // Called when a question is answered correctly
  const incrementZoom = useCallback((stopIndex, questionId) => {
    setSession((prev) => {
      const current = prev.stopProgress[stopIndex] || { zoomLevel: 0, answeredQuestions: [], hintRevealed: false };
      const alreadyAnswered = current.answeredQuestions.includes(questionId);

      const next = {
        ...prev,
        stopProgress: {
          ...prev.stopProgress,
          [stopIndex]: {
            ...current,
            zoomLevel: alreadyAnswered ? current.zoomLevel : current.zoomLevel + 1,
            answeredQuestions: alreadyAnswered
              ? current.answeredQuestions
              : [...current.answeredQuestions, questionId],
          },
        },
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const revealHint = useCallback((stopIndex) => {
    setSession((prev) => {
      const current = prev.stopProgress[stopIndex] || { zoomLevel: 0, answeredQuestions: [], hintRevealed: false };
      const next = {
        ...prev,
        stopProgress: {
          ...prev.stopProgress,
          [stopIndex]: { ...current, hintRevealed: true },
        },
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // Start the game at stop 0 (first stop is always given, no QR needed to start)
  const startGame = useCallback(() => {
    setSession((prev) => {
      const next = {
        ...prev,
        currentStopIndex: 0,
        unlockedStops: [0],
        stopProgress: {
          0: { zoomLevel: 0, answeredQuestions: [], hintRevealed: false },
        },
        startedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetGame = useCallback(() => {
    const fresh = buildInitialSession();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    setSession(fresh);
  }, []);

  // Called when the player correctly guesses the location name — jumps straight to full zoom
  const revealFull = useCallback((stopIndex, maxZoom) => {
    setSession((prev) => {
      const current = prev.stopProgress[stopIndex] || { zoomLevel: 0, answeredQuestions: [], hintRevealed: false };
      const next = {
        ...prev,
        stopProgress: {
          ...prev.stopProgress,
          [stopIndex]: { ...current, zoomLevel: maxZoom, locationGuessed: true },
        },
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const getStopProgress = useCallback(
    (stopIndex) =>
      session.stopProgress[stopIndex] || { zoomLevel: 0, answeredQuestions: [], hintRevealed: false },
    [session.stopProgress]
  );

  // Called when the puzzle QR code ("cofre") is scanned — marks puzzle as unlocked
  const unlockPuzzle = useCallback(() => {
    setSession((prev) => {
      const next = { ...prev, puzzleUnlocked: true, lastUpdated: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { session, unlockStop, unlockPuzzle, incrementZoom, revealFull, revealHint, startGame, resetGame, getStopProgress };
}
