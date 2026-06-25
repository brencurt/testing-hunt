import { useState, useEffect } from 'react';
import { api } from './services/api';
import { useGameSession } from './hooks/useGameSession';
import WelcomePage from './pages/WelcomePage';
import StopPage from './pages/StopPage';
import WinPage from './pages/WinPage';
import PuzzleIntroPage from './pages/PuzzleIntroPage';
import FinalPuzzlePage from './pages/FinalPuzzlePage';
import QRScanner from './components/QRScanner';
import './App.css';

// App state machine:
//   welcome → stop → scan → stop (loop) → puzzle_intro → puzzle → win

export default function App() {
  const [meta, setMeta] = useState(null);
  const [view, setView] = useState('welcome'); // welcome | stop | scan | puzzle_intro | puzzle | win
  const [winMessage, setWinMessage] = useState('');
  const { session, startGame, unlockStop, incrementZoom, revealFull, revealHint, resetGame, getStopProgress } = useGameSession();

  // Load game meta on mount
  useEffect(() => {
    api.getMeta().then(setMeta).catch(() => {});
  }, []);

  // Restore session: if player already started, go straight to their current stop
  useEffect(() => {
    if (session.currentStopIndex !== null) {
      // Stop 9 is the final puzzle — restore to puzzle intro rather than stop
      if (session.currentStopIndex === 9) {
        setView('puzzle_intro');
      } else {
        setView('stop');
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleStart() {
    startGame();
    setView('stop');
  }

  function handleQRSuccess(result) {
    // result = { valid: true, unlocksStop: number, stopType: string }
    unlockStop(result.unlocksStop);
    if (result.stopType === 'final_puzzle') {
      setView('puzzle_intro');
    } else {
      setView('stop');
    }
  }

  function handleGoToScan() {
    setView('scan');
  }

  function handleZoom(stopIndex, questionId) {
    incrementZoom(stopIndex, questionId);
  }

  function handleRevealFull(stopIndex, maxZoom) {
    revealFull(stopIndex, maxZoom);
  }

  function handleRevealHint(stopIndex) {
    revealHint(stopIndex);
  }

  function handlePuzzleWin(message) {
    setWinMessage(message);
    setView('win');
  }

  function handleRestart() {
    resetGame();
    setWinMessage('');
    setView('welcome');
  }

  const currentIndex = session.currentStopIndex ?? 0;
  const progress = getStopProgress(currentIndex);

  if (!meta && view === 'welcome') {
    return (
      <div className="app-shell">
        <div className="app-loading">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="app-content">
        {view === 'welcome' && (
          <WelcomePage onStart={handleStart} playerName={meta?.playerName || 'Luli'} />
        )}

        {view === 'stop' && (
          <StopPage
            stopIndex={currentIndex}
            zoomLevel={progress.zoomLevel}
            answeredQuestions={progress.answeredQuestions}
            hintRevealed={progress.hintRevealed}
            onZoom={handleZoom}
            onRevealFull={handleRevealFull}
            onRevealHint={handleRevealHint}
            onGoToScan={handleGoToScan}
          />
        )}

        {view === 'scan' && (
          <QRScanner
            onSuccess={handleQRSuccess}
            onCancel={() => setView('stop')}
          />
        )}

        {view === 'puzzle_intro' && (
          <PuzzleIntroPage onStart={() => setView('puzzle')} />
        )}

        {view === 'puzzle' && (
          <FinalPuzzlePage onWin={handlePuzzleWin} />
        )}

        {view === 'win' && (
          <WinPage
            finalMessage={winMessage || meta?.finalMessage || '¡Feliz cumpleaños!'}
            onRestart={handleRestart}
          />
        )}
      </div>
    </div>
  );
}
