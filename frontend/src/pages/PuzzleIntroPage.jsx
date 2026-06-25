import './PuzzleIntroPage.css';

export default function PuzzleIntroPage({ onStart }) {
  return (
    <div className="puzzle-intro">
      <div className="chest-wrapper">
        <div className="chest-body">
          <div className="chest-lid" />
          <div className="chest-lock">🔒</div>
        </div>
      </div>

      <p className="puzzle-intro-text">
        Estás casi al final del recorrido, te falta resolver un último desafío.
      </p>
      <p className="puzzle-intro-text">
        En casa vas a encontrar el cofre, pero ¿la llave?
      </p>
      <p className="puzzle-intro-text">
        Cuando tengas el cofre en tus manos presioná el botón:
      </p>

      <button className="puzzle-intro-btn" onClick={onStart}>
        ¿Dónde está la llave?
      </button>
    </div>
  );
}
