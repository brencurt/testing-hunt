import './WelcomePage.css';

export default function WelcomePage({ onStart, playerName }) {
  return (
    <div className="welcome-page">
      <div className="welcome-top">
        <img src="/rainbow.png" alt="" className="welcome-img" />
        <h1 className="welcome-title">¡Bienvenida a la caza de tu regalo de cumpleaños!</h1>
        <p className="welcome-subtitle">Todavía no es tu cumpleaños pero vamos a pasar tus últimas horas con 34 años buscando tu regalo.</p>
        <p className="welcome-subtitle">Para eso vamos a ir a ciertos lugares de Berlín bastante simbólicos para vos (o para las dos), pero para llegar vas a tener que afinar tu ojo y reconocer las paradas.</p>
        <p className="welcome-subtitle">De paso en alguna quizás nos tomamos una cerveza 😉</p>
      </div>

      <div className="welcome-rules">
        <div className="rule">
          <span className="rule-icon">🔍</span>
          <p>Cada pista es una foto muy ampliada. ¿Reconocés el lugar?</p>
        </div>
        <div className="rule">
          <span className="rule-icon">❓</span>
          <p>Si no lo reconocés, respondé las preguntas para hacer zoom out poco a poco.</p>
        </div>
        <div className="rule">
          <span className="rule-icon">📷</span>
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
