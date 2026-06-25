// All backend fetch() calls live here.
// VITE_API_URL is set at build time via .env files.
// In production, VITE_API_URL is empty and Nginx serves /api/ from the same host.
// In development, it points to http://localhost:3001.
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  getMeta: () => request('/api/game/meta'),

  getStop: (index) => request(`/api/game/stop/${index}`),

  validateQR: (qrCode) =>
    request('/api/game/validate-qr', {
      method: 'POST',
      body: JSON.stringify({ qrCode }),
    }),

  checkAnswer: (stopIndex, questionId, answer) =>
    request(`/api/game/stop/${stopIndex}/check-answer`, {
      method: 'POST',
      body: JSON.stringify({ questionId, answer }),
    }),

  getHint: (stopIndex) => request(`/api/game/stop/${stopIndex}/hint`),

  getPuzzleFriends: () => request('/api/game/puzzle/friends'),

  getPuzzleClues: () => request('/api/game/puzzle/clues'),

  validatePuzzle: (answers) =>
    request('/api/game/validate-puzzle', {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),
};
