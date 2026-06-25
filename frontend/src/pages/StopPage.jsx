import { useState, useEffect } from 'react';
import { api } from '../services/api';
import CluePhoto from '../components/CluePhoto';
import QuestionModal from '../components/QuestionModal';
import HintReveal from '../components/HintReveal';
import './StopPage.css';

function normalizeLocation(str) {
  return str.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export default function StopPage({ stopIndex, zoomLevel, answeredQuestions, hintRevealed, onZoom, onRevealFull, onRevealHint, onGoToScan }) {
  const [stop, setStop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [locationGuess, setLocationGuess] = useState('');
  const [locationStatus, setLocationStatus] = useState('idle'); // idle | correct | wrong

  useEffect(() => {
    setLoading(true);
    api.getStop(stopIndex)
      .then(setStop)
      .finally(() => setLoading(false));
  }, [stopIndex]);

  if (loading) {
    return <div className="stop-loading">Cargando pista...</div>;
  }

  if (!stop) {
    return <div className="stop-error">No se pudo cargar la pista.</div>;
  }

  // Next unanswered question for this stop
  const nextQuestion = stop.questions?.find(
    (q) => !answeredQuestions.includes(q.id) && q.zoomLevelUnlocked === zoomLevel + 1
  );

  const isFullyZoomed = zoomLevel >= (stop.questions?.length || 0);

  return (
    <div className="stop-page">
      <StopHeader stopIndex={stopIndex} total={stop.totalStops} />

      <CluePhoto imageFile={stop.imageFile} zoomLevel={zoomLevel} />

      {!isFullyZoomed && (
        <form
          className="location-guess-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!locationGuess.trim()) return;
            const normalized = normalizeLocation(locationGuess);
            const expected = normalizeLocation(stop.locationName);
            const isMatch = normalized === expected ||
              (normalized.length >= 4 && expected.startsWith(normalized));
            if (isMatch) {
              setLocationStatus('correct');
              onRevealFull(stopIndex, stop.questions.length);
            } else {
              setLocationStatus('wrong');
              setLocationGuess('');
            }
          }}
        >
          <label className="location-guess-label">
            Si reconocés el lugar, escribilo:
          </label>
          <div className="location-guess-row">
            <input
              className={`location-guess-input ${locationStatus === 'wrong' ? 'location-guess-input--wrong' : ''}`}
              type="text"
              value={locationGuess}
              onChange={(e) => { setLocationGuess(e.target.value); setLocationStatus('idle'); }}
              placeholder="Nombre del lugar..."
              autoComplete="off"
            />
            <button className="location-guess-btn" type="submit">→</button>
          </div>
          {locationStatus === 'wrong' && (
            <p className="location-guess-msg location-guess-msg--wrong">Ese no es... ¡seguí mirando!</p>
          )}
        </form>
      )}


      <div className="stop-actions">
        {!isFullyZoomed && nextQuestion && (
          <div className="zoom-out-section">
            <p className="zoom-out-hint">
              Si no reconocés el lugar podés hacer zoom out de la imagen,
              pero para eso vas a tener que responder una pregunta.
              Si estás de acuerdo presioná el botón:
            </p>
            <button className="zoom-out-btn" onClick={() => setActiveQuestion(nextQuestion)}>
              Hacer zoom out
            </button>
          </div>
        )}

        {isFullyZoomed && (
          <p className="stop-full-zoom-msg">
            ¡Bien! Ahora ve al lugar y escanea el código QR.
          </p>
        )}

        {isFullyZoomed && (
          <button className="scan-btn" onClick={onGoToScan}>
            📷 Escanear QR
          </button>
        )}

        <HintReveal
          stopIndex={stopIndex}
          alreadyRevealed={hintRevealed}
          onReveal={() => onRevealHint(stopIndex)}
        />
      </div>

      {activeQuestion && (
        <QuestionModal
          stopIndex={stopIndex}
          question={activeQuestion}
          onCorrect={(questionId) => {
            onZoom(stopIndex, questionId);
            setActiveQuestion(null);
          }}
          onClose={() => setActiveQuestion(null)}
        />
      )}
    </div>
  );
}

function StopHeader({ stopIndex, total }) {
  return (
    <div className="stop-header">
      <div className="stop-progress-bar">
        <div
          className="stop-progress-fill"
          style={{ width: `${((stopIndex + 1) / total) * 100}%` }}
        />
      </div>
      <p className="stop-counter">Parada {stopIndex + 1} de {total}</p>
    </div>
  );
}
