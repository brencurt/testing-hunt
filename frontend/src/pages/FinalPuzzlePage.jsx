import { useState, useEffect, useRef, useCallback } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { api } from '../services/api';
import './FinalPuzzlePage.css';

const MODEL_URL = '/models';
const BASE_URL = import.meta.env.VITE_API_URL ?? '';
const IS_DEV = import.meta.env.DEV;

// How many times face detection can fail before showing manual fallback
const MAX_RETRIES = 2;

export default function FinalPuzzlePage({ onWin }) {
  const [modelsReady, setModelsReady] = useState(false);
  const [modelError, setModelError] = useState(false);
  const [clues, setClues] = useState([]);           // [{ clue }]
  const [friends, setFriends] = useState([]);        // [{ name, photo }]
  const [matcher, setMatcher] = useState(null);      // faceapi.FaceMatcher
  const [slots, setSlots] = useState([]);            // [{ clue, capturedName: null|string }]
  const [activeSlot, setActiveSlot] = useState(null); // index of slot whose camera is open
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognizeMsg, setRecognizeMsg] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [wrongOrder, setWrongOrder] = useState(false);
  const [manualName, setManualName] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // ── 1. Load face-api models ────────────────────────────────────────────────
  useEffect(() => {
    async function loadModels() {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        setModelsReady(true);
      } catch {
        setModelError(true);
      }
    }
    loadModels();
  }, []);

  // ── 2. Load clues and friends from backend ────────────────────────────────
  useEffect(() => {
    Promise.all([api.getPuzzleClues(), api.getPuzzleFriends()])
      .then(([clueData, friendData]) => {
        setClues(clueData);
        setFriends(friendData);
        setSlots(clueData.map(c => ({ clue: c.clue, capturedName: null })));
      })
      .catch(() => {});
  }, []);

  // ── 3. Build FaceMatcher once models + friends are ready ──────────────────
  useEffect(() => {
    if (!modelsReady || friends.length === 0) return;

    async function buildMatcher() {
      try {
        const labeled = await Promise.all(
          friends.map(async ({ name, photo }) => {
            const img = await faceapi.fetchImage(`${BASE_URL}/images/friends/${photo}`);
            const detection = await faceapi
              .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks(true)
              .withFaceDescriptor();

            if (!detection) {
              console.warn(`No face detected in reference photo for ${name}`);
              return null;
            }
            return new faceapi.LabeledFaceDescriptors(name, [detection.descriptor]);
          })
        );
        const valid = labeled.filter(Boolean);
        if (valid.length > 0) {
          setMatcher(new faceapi.FaceMatcher(valid, 0.55));
        }
      } catch (e) {
        console.error('Error building face matcher:', e);
      }
    }
    buildMatcher();
  }, [modelsReady, friends]);

  // ── Camera helpers ────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      // Fallback: try without facingMode constraint
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        setRecognizeMsg('No se pudo acceder a la cámara.');
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  function openCamera(slotIndex) {
    setActiveSlot(slotIndex);
    setRecognizeMsg('');
    setRetryCount(0);
    setManualName('');
  }

  useEffect(() => {
    if (activeSlot !== null) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [activeSlot, startCamera, stopCamera]);

  // ── Capture & recognize ───────────────────────────────────────────────────
  async function handleCapture() {
    if (!videoRef.current || !canvasRef.current || !matcher) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    setIsRecognizing(true);
    setRecognizeMsg('Analizando...');

    try {
      const detection = await faceapi
        .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      if (!detection) {
        const newCount = retryCount + 1;
        setRetryCount(newCount);
        if (newCount >= MAX_RETRIES) {
          setRecognizeMsg('No detecté ningún rostro. Ingresá el nombre manualmente:');
        } else {
          setRecognizeMsg('No detecté ningún rostro. Intentá de nuevo con mejor luz.');
        }
        setIsRecognizing(false);
        return;
      }

      const match = matcher.findBestMatch(detection.descriptor);

      if (match.label === 'unknown') {
        const newCount = retryCount + 1;
        setRetryCount(newCount);
        if (newCount >= MAX_RETRIES) {
          setRecognizeMsg('No reconocí a nadie. Ingresá el nombre manualmente:');
        } else {
          setRecognizeMsg('No reconocí a nadie. ¿Es la persona indicada? Intentá de nuevo.');
        }
        setIsRecognizing(false);
        return;
      }

      // Recognized!
      const name = match.label;
      setSlots(prev =>
        prev.map((s, i) => (i === activeSlot ? { ...s, capturedName: name } : s))
      );
      stopCamera();
      setActiveSlot(null);
    } catch {
      setRecognizeMsg('Error al analizar la foto. Intentá de nuevo.');
    } finally {
      setIsRecognizing(false);
    }
  }

  function handleManualSubmit(e) {
    e.preventDefault();
    const normalized = manualName.trim();
    if (!normalized) return;

    // Case-insensitive match against known friend names
    const match = friends.find(f => f.name.toLowerCase() === normalized.toLowerCase());
    const name = match ? match.name : normalized;

    setSlots(prev =>
      prev.map((s, i) => (i === activeSlot ? { ...s, capturedName: name } : s))
    );
    stopCamera();
    setActiveSlot(null);
  }

  function clearSlot(slotIndex) {
    setSlots(prev =>
      prev.map((s, i) => (i === slotIndex ? { ...s, capturedName: null } : s))
    );
  }

  // ── Verify order ──────────────────────────────────────────────────────────
  const allFilled = slots.length === 6 && slots.every(s => s.capturedName !== null);

  async function handleVerify() {
    if (!allFilled) return;
    setIsVerifying(true);
    setWrongOrder(false);

    try {
      const answers = slots.map(s => s.capturedName);
      const result = await api.validatePuzzle(answers);

      if (result.correct) {
        onWin(result.finalMessage);
      } else {
        setWrongOrder(true);
      }
    } catch {
      setWrongOrder(true);
    } finally {
      setIsVerifying(false);
    }
  }

  function handleRetry() {
    setSlots(prev => prev.map(s => ({ ...s, capturedName: null })));
    setWrongOrder(false);
  }

  // ── Dev helpers (only in development) ────────────────────────────────────
  function devFillCorrect() {
    // friends array is in the same order as slots (correct order)
    setSlots(prev =>
      prev.map((s, i) => ({ ...s, capturedName: friends[i]?.name ?? s.capturedName }))
    );
    setWrongOrder(false);
  }

  function devFillWrong() {
    // Reverse order → always wrong
    const reversed = [...friends].reverse();
    setSlots(prev =>
      prev.map((s, i) => ({ ...s, capturedName: reversed[i]?.name ?? s.capturedName }))
    );
    setWrongOrder(false);
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const isLoading = !modelsReady || slots.length === 0 || !matcher;

  if (modelError) {
    return (
      <div className="fp-shell fp-error">
        <p>No se pudieron cargar los modelos de reconocimiento facial.</p>
        <p>Recargá la página e intentá de nuevo.</p>
      </div>
    );
  }

  return (
    <div className="fp-shell">
      <h1 className="fp-title">El puzzle final</h1>
      <p className="fp-subtitle">
        Leé cada pista y sacale una foto a la amiga que corresponde, en orden.
      </p>

      {isLoading && (
        <div className="fp-loading">
          <div className="fp-spinner" />
          <p>Preparando reconocimiento facial...</p>
        </div>
      )}

      {!isLoading && (
        <div className="fp-slots">
          {slots.map((slot, i) => (
            <div key={i} className={`fp-slot ${slot.capturedName ? 'fp-slot--done' : ''}`}>
              <div className="fp-slot-num">{i + 1}</div>
              <div className="fp-slot-body">
                <p className="fp-slot-clue">{slot.clue}</p>
                {slot.capturedName ? (
                  <div className="fp-slot-result">
                    <span className="fp-slot-name">✓ {slot.capturedName}</span>
                    <button className="fp-slot-clear" onClick={() => clearSlot(i)}>✕</button>
                  </div>
                ) : (
                  <button className="fp-slot-camera" onClick={() => openCamera(i)}>
                    📷 Sacar foto
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {wrongOrder && (
        <div className="fp-wrong">
          <p>El orden no es correcto... ¡Volvé a intentarlo!</p>
          <button className="fp-retry-btn" onClick={handleRetry}>Empezar de nuevo</button>
        </div>
      )}

      {allFilled && !wrongOrder && (
        <button
          className="fp-verify-btn"
          onClick={handleVerify}
          disabled={isVerifying}
        >
          {isVerifying ? 'Verificando...' : 'Verificar orden'}
        </button>
      )}

      {/* Dev panel — only visible in development */}
      {IS_DEV && slots.length > 0 && friends.length > 0 && (
        <div className="fp-dev-panel">
          <span className="fp-dev-label">🛠 dev</span>
          <button className="fp-dev-btn" onClick={devFillCorrect}>✓ correcto</button>
          <button className="fp-dev-btn" onClick={devFillWrong}>✗ incorrecto</button>
        </div>
      )}

      {/* Camera modal */}
      {activeSlot !== null && (
        <div className="fp-modal-overlay">
          <div className="fp-modal">
            <h2 className="fp-modal-title">
              Pista {activeSlot + 1}: {slots[activeSlot]?.clue}
            </h2>

            <div className="fp-video-wrap">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="fp-video"
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>

            {recognizeMsg && (
              <p className="fp-recognize-msg">{recognizeMsg}</p>
            )}

            {retryCount >= MAX_RETRIES && (
              <form onSubmit={handleManualSubmit} className="fp-manual-form">
                <input
                  className="fp-manual-input"
                  type="text"
                  placeholder="Nombre de la amiga..."
                  value={manualName}
                  onChange={e => setManualName(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="fp-manual-submit">Confirmar</button>
              </form>
            )}

            <div className="fp-modal-actions">
              {retryCount < MAX_RETRIES && (
                <button
                  className="fp-capture-btn"
                  onClick={handleCapture}
                  disabled={isRecognizing}
                >
                  {isRecognizing ? 'Analizando...' : '📷 Sacar foto'}
                </button>
              )}
              <button
                className="fp-cancel-btn"
                onClick={() => { stopCamera(); setActiveSlot(null); }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
