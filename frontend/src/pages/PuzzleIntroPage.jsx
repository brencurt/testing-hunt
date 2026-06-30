import './PuzzleIntroPage.css';

export default function PuzzleIntroPage({ onStart }) {
  return (
    <div className="puzzle-intro">
      <h2 className="puzzle-intro-title">¡Muy bien! ¡Falta poco!</h2>
      <img src="/chest.png" alt="" className="chest-img" />

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
