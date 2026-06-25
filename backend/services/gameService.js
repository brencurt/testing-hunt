const path = require('path');

// Load game config once at startup
const config = require(path.join(__dirname, '../config/game.json'));

// Fields that are never sent to the frontend
const STRIP_FIELDS = ['qrCode', 'phoneNumber', 'internalNotes'];

// Fields stripped from each question object before sending to frontend
const STRIP_QUESTION_FIELDS = ['answer', 'answerAlternatives'];

/**
 * Normalize an answer string for comparison:
 * lowercase, trim whitespace, remove diacritics (ö→o, ü→u, etc.)
 */
function normalizeAnswer(str) {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // strip combining diacritical marks
}

/**
 * Return sanitized stop data safe to send to the frontend.
 * Strips secrets (qrCode, phoneNumber, answers, internalNotes).
 */
function getStop(index) {
  const stop = config.stops.find(s => s.stopIndex === index);
  if (!stop) return null;

  const safe = { ...stop };

  // Strip top-level secret fields
  for (const field of STRIP_FIELDS) {
    delete safe[field];
  }

  // Strip answers from questions
  if (safe.questions) {
    safe.questions = safe.questions.map(q => {
      const safeQ = { ...q };
      for (const field of STRIP_QUESTION_FIELDS) {
        delete safeQ[field];
      }
      return safeQ;
    });
  }

  safe.isLastStop = index === config.stops.length - 1;
  safe.totalStops = config.stops.length;

  return safe;
}

/**
 * Validate a scanned QR code string.
 * Returns { valid, unlocksStop, stopType } or { valid: false }.
 */
function validateQRCode(qrCode) {
  if (!qrCode || typeof qrCode !== 'string') {
    return { valid: false };
  }

  const stop = config.stops.find(s => s.qrCode === qrCode.trim());
  if (!stop) {
    return { valid: false };
  }

  return {
    valid: true,
    unlocksStop: stop.stopIndex,
    stopType: stop.type,
  };
}

/**
 * Check if a given answer is correct for a question.
 * Returns { correct: boolean }.
 */
function checkAnswer(stopIndex, questionId, answer) {
  const stop = config.stops.find(s => s.stopIndex === stopIndex);
  if (!stop) return { correct: false };

  const question = (stop.questions || []).find(q => q.id === questionId);
  if (!question) return { correct: false };

  const normalized = normalizeAnswer(answer);
  const validAnswers = [question.answer, ...(question.answerAlternatives || [])].map(normalizeAnswer);

  return { correct: validAnswers.includes(normalized) };
}

/**
 * Return the QR-code location hint for a stop.
 */
function getHint(stopIndex) {
  const stop = config.stops.find(s => s.stopIndex === stopIndex);
  if (!stop || !stop.hint) return null;
  return stop.hint;
}

/**
 * Return game metadata (safe to expose).
 */
function getMeta() {
  return config.meta;
}

/**
 * Return the list of friends (name + photo filename).
 * Used by the frontend to load reference images for face recognition.
 */
function getFriends() {
  return (config.finalPuzzle?.slots || []).map(({ friend, photo }) => ({ name: friend, photo }));
}

/**
 * Return the list of puzzle clues (without revealing which friend belongs to each slot).
 */
function getPuzzleClues() {
  return (config.finalPuzzle?.slots || []).map(({ clue }) => ({ clue }));
}

/**
 * Validate the player's submitted answer order.
 * @param {string[]} answers - Ordered array of friend names (one per slot)
 * @returns {{ correct: boolean, finalMessage?: string }}
 */
function validatePuzzle(answers) {
  const slots = config.finalPuzzle?.slots || [];

  if (!Array.isArray(answers) || answers.length !== slots.length) {
    return { correct: false };
  }

  const allCorrect = slots.every((slot, i) => slot.friend === answers[i]);

  if (allCorrect) {
    return { correct: true, finalMessage: config.meta.finalMessage };
  }

  return { correct: false };
}

module.exports = { getStop, validateQRCode, checkAnswer, getHint, getMeta, getFriends, getPuzzleClues, validatePuzzle };
