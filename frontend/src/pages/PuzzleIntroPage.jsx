import './PuzzleIntroPage.css';

export default function PuzzleIntroPage({ onStart }) {
  return (
    <div className="puzzle-intro">
      <div className="puzzle-intro-icon">🔐</div>
      <h1 className="puzzle-intro-title">¡Última parada!</h1>
      <p className="puzzle-intro-text">
        Tus amigas tienen la clave para desbloquear el mensaje final.
      </p>
      <p className="puzzle-intro-text">
        Leé cada pista con atención y sacales una foto en el orden correcto.
      </p>
      <button className="puzzle-intro-btn" onClick={onStart}>
        Iniciar
      </button>
    </div>
  );
}
