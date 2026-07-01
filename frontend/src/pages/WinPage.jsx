import './WinPage.css';

export default function WinPage({ finalMessage, finalHighlight, onRestart }) {
  const [firstLine, ...rest] = finalMessage.split('\n');

  return (
    <div className="win-page">
      <img src="/luli.png" alt="Luli" className="win-photo" />
      <h1 className="win-title">¡Lo lograste!</h1>
      <p className="win-message">
        {firstLine}
        {finalHighlight && (
          <><br /><strong className="win-highlight">{finalHighlight}</strong></>
        )}
        {rest.length > 0 && <><br />{rest.join('\n')}</>}
      </p>
      <button className="win-restart-btn" onClick={onRestart}>
        Volver al principio
      </button>
    </div>
  );
}
