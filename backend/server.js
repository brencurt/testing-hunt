const express = require('express');
const cors = require('cors');
const path = require('path');

const gameRoutes = require('./routes/game');
const healthRoute = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 3001;

// Browsers send Origin even through nginx proxy, so we must allow it.
// In production nginx is the only entry point, so localhost:80 is the only browser origin.
// In dev, Vite runs on :5173.
// ALLOWED_ORIGIN is set in docker-compose for the production domain (e.g. https://luli.duckdns.org)
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.ALLOWED_ORIGIN, 'http://localhost', 'http://127.0.0.1'].filter(Boolean)
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, same-origin via nginx proxy)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
}));

app.use(express.json());

// Serve stop images as static files
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Routes
app.use('/health', healthRoute);
app.use('/api/game', gameRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
