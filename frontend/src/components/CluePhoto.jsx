import './CluePhoto.css';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

// zoomLevel 0 = most zoomed in (abstract), 4 = full photo visible
export default function CluePhoto({ imageFile, zoomLevel }) {
  const src = `${BASE_URL}/images/${imageFile}`;

  return (
    <div className="clue-photo-container">
      <img
        className={`clue-photo-image zoom-level-${zoomLevel}`}
        src={src}
        alt="Pista de ubicación"
        draggable={false}
      />
    </div>
  );
}
