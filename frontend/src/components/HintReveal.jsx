import { useState } from 'react';
import { api } from '../services/api';
import './HintReveal.css';

export default function HintReveal({ stopIndex, alreadyRevealed, onReveal }) {
  const [hint, setHint] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleReveal() {
    if (hint) return; // already loaded in this session
    setLoading(true);
    try {
      const data = await api.getHint(stopIndex);
      setHint(data.hint);
      onReveal(); // persist to session
    } catch {
      setHint('No hay pista disponible para esta parada.');
    } finally {
      setLoading(false);
    }
  }

  if (hint) {
    return (
      <div className="hint-box">
        <span className="hint-icon">📍</span>
        <p className="hint-text">{hint}</p>
      </div>
    );
  }

  return (
    <div className="hint-reveal-section">
      <p className="hint-reveal-label">Si al llegar al lugar no encontrás el QR, podés pedir una ayuda:</p>
      <button className="hint-btn" onClick={handleReveal} disabled={loading}>
        {loading ? 'Buscando...' : 'Ver pista'}
      </button>
    </div>
  );
}
