const express = require('express');
const router = express.Router();

// Used by Docker health checks and future Kubernetes liveness probes
router.get('/', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
