const express = require('express');
const router = express.Router();
const game = require('../services/gameService');


// GET /api/game/meta
// Returns public game metadata (player name, total stops, etc.)
router.get('/meta', (req, res) => {
  res.json(game.getMeta());
});

// POST /api/game/validate-qr
// Body: { qrCode: string }
// Validates a scanned QR code and returns which stop it unlocks
router.post('/validate-qr', (req, res) => {
  const { qrCode } = req.body;

  if (!qrCode) {
    return res.status(400).json({ error: 'qrCode is required' });
  }

  const result = game.validateQRCode(qrCode);
  res.json(result);
});

// GET /api/game/stop/:index
// Returns sanitized stop data (no secrets, no answers)
router.get('/stop/:index', (req, res) => {
  const index = parseInt(req.params.index, 10);

  if (isNaN(index) || index < 0) {
    return res.status(400).json({ error: 'Invalid stop index' });
  }

  const stop = game.getStop(index);
  if (!stop) {
    return res.status(404).json({ error: 'Stop not found' });
  }

  res.json(stop);
});

// POST /api/game/stop/:index/check-answer
// Body: { questionId: string, answer: string }
// Checks a zoom-out question answer server-side (answers never leave the server)
router.post('/stop/:index/check-answer', (req, res) => {
  const index = parseInt(req.params.index, 10);
  const { questionId, answer } = req.body;

  if (isNaN(index) || !questionId || answer === undefined) {
    return res.status(400).json({ error: 'stopIndex, questionId, and answer are required' });
  }

  const result = game.checkAnswer(index, questionId, String(answer));
  res.json(result);
});

// GET /api/game/stop/:index/hint
// Returns the QR code location hint for a stop
router.get('/stop/:index/hint', (req, res) => {
  const index = parseInt(req.params.index, 10);

  if (isNaN(index) || index < 0) {
    return res.status(400).json({ error: 'Invalid stop index' });
  }

  const hint = game.getHint(index);
  if (hint === null) {
    return res.status(404).json({ error: 'No hint for this stop' });
  }

  res.json({ hint });
});

// GET /api/game/puzzle/friends
// Returns name + photo filename for each friend (used to load face descriptors in browser)
router.get('/puzzle/friends', (req, res) => {
  res.json(game.getFriends());
});

// GET /api/game/puzzle/clues
// Returns the ordered list of clues (no answers revealed)
router.get('/puzzle/clues', (req, res) => {
  res.json(game.getPuzzleClues());
});

// POST /api/game/validate-puzzle
// Body: { answers: ["Sabri", "Georgi", ...] }
// Validates the submitted friend order against the correct one
router.post('/validate-puzzle', (req, res) => {
  const { answers } = req.body;

  if (!Array.isArray(answers)) {
    return res.status(400).json({ error: 'answers must be an array' });
  }

  const result = game.validatePuzzle(answers);
  res.json(result);
});

module.exports = router;
