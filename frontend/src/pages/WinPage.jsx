import './WinPage.css';

export default function WinPage({ finalMessage, onRestart }) {
  return (
    <div className="win-page">
      <div className="win-confetti">🎉🎂🎊🎈</div>
      <h1 className="win-title">¡Lo lograste!</h1>
      <p className="win-message">{finalMessage}</p>
      <button className="win-restart-btn" onClick={onRestart}>
        Volver al principio
      </button>
    </div>
  );
}
