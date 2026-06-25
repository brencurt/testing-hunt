import './WelcomePage.css';

export default function WelcomePage({ onStart, playerName }) {
  return (
    <div className="welcome-page">
      <div className="welcome-top">
        <div className="welcome-emoji">🎂</div>
        <h1 className="welcome-title">¡Feliz cumpleaños,<br />{playerName}!</h1>
        <p className="welcome-subtitle">
          Tu regalo de cumpleaños es una caza del tesoro por Berlín.
          Tienes que ir a 10 lugares especiales... pero tendrás que descubrir cuáles son.
        </p>
      </div>

      <div className="welcome-rules">
        <div className="rule">
          <span className="rule-icon">🔍</span>
          <p>Cada pista es una foto muy ampliada. ¿Reconoces el lugar?</p>
        </div>
        <div className="rule">
          <span className="rule-icon">❓</span>
          <p>Si no lo reconoces, responde preguntas para hacer zoom out poco a poco.</p>
        </div>
        <div className="rule">
          <span className="rule-icon">📱</span>
          <p>Cuando llegues al lugar, escanea el código QR para desbloquear la siguiente pista.</p>
        </div>
        <div className="rule">
          <span className="rule-icon">📞</span>
          <p>Algunas paradas son llamadas sorpresa. ¿Sabrás quién te llama?</p>
        </div>
      </div>

      <button className="welcome-start-btn" onClick={onStart}>
        Empezar la caza 🗺️
      </button>

      <p className="welcome-note">Tu progreso se guarda automáticamente si cierras la app.</p>
    </div>
  );
}
