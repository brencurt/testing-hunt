import { useState } from 'react';
import { api } from '../services/api';
import './QuestionModal.css';

export default function QuestionModal({ stopIndex, question, onCorrect, onClose }) {
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState('idle'); // idle | checking | wrong | error
  const [attempts, setAttempts] = useState(0);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!answer.trim()) return;

    setStatus('checking');
    try {
      const { correct } = await api.checkAnswer(stopIndex, question.id, answer);
      if (correct) {
        onCorrect(question.id);
      } else {
        setAttempts((a) => a + 1);
        setStatus('wrong');
        setAnswer('');
      }
    } catch (err) {
      console.error('check-answer failed:', err);
      setStatus('error');
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">✕</button>

        <div className="modal-zoom-label">Desbloquear zoom nivel {question.zoomLevelUnlocked}</div>

        <p className="modal-question">{question.text}</p>

        <form onSubmit={handleSubmit} className="modal-form">
          <input
            className={`modal-input ${status === 'wrong' ? 'modal-input--wrong' : ''}`}
            type="text"
            value={answer}
            onChange={(e) => { setAnswer(e.target.value); setStatus('idle'); }}
            placeholder="Tu respuesta..."
            autoFocus
            autoComplete="off"
          />
          <button
            className="modal-submit"
            type="submit"
            disabled={status === 'checking'}
          >
            {status === 'checking' ? '...' : 'Comprobar'}
          </button>
        </form>

        {status === 'wrong' && (
          <p className="modal-wrong-msg">
            {attempts === 1 ? '¡Casi! Intenta de nuevo.' : 'No es esa... ¡sigue intentando!'}
          </p>
        )}

        {status === 'error' && (
          <p className="modal-wrong-msg">
            Error de conexión. Revisa que el servidor esté corriendo.
          </p>
        )}
      </div>
    </div>
  );
}
