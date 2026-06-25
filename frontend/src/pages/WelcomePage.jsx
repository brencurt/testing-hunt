import './WelcomePage.css';

export default function WelcomePage({ onStart, playerName }) {
  return (
    <div className="welcome-page">
      <div className="welcome-top">
        <div className="welcome-emoji">🎂</div>
        <h1 className="welcome-title">¿Estás lista para salir a buscar tu regalo de cumpleaños?</h1>
        <p className="welcome-subtitle">
          Vamos a ir a algunos lugares de Berlín bastante simbólicos para vos (o para las dos),
          pero para llegar vas a tener que afinar tu ojo y reconocer las paradas.
        </p>
      </div>

      <div className="welcome-rules">
        <div className="rule">
          <span className="rule-icon">🔍</span>
          <p>Cada pista es una foto muy ampliada. ¿Reconocés el lugar?</p>
        </div>
        <div className="rule">
          <span className="rule-icon">❓</span>
          <p>Si no lo reconocés, respondé preguntas para hacer zoom out poco a poco.</p>
        </div>
        <div className="rule">
          <span className="rule-icon">📱</span>
          <p>Cuando llegués al lugar, escaneá el código QR para desbloquear la siguiente pista.</p>
        </div>
      </div>

      <button className="welcome-start-btn" onClick={onStart}>
        ¡Empezar!
      </button>

      <p className="welcome-note">Tu progreso se guarda automáticamente si cerrás la app.</p>
    </div>
  );
}
