/**
 * server.js — Entry point for the Airbnb Clone Node.js backend
 * Sets up Express, connects to MongoDB, registers all routes,
 * and starts the HTTP server.
 */

const dns = require('dns');
dns.setServers(['8.8.8.8']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env
dotenv.config();

// ─── Route imports ───────────────────────────────────────────────────────────
const userRoutes = require('./routes/userRoutes');
const accommodationRoutes = require('./routes/accommodationRoutes');
const reservationRoutes = require('./routes/reservationRoutes');

// ─── App init ────────────────────────────────────────────────────────────────
const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────

// CORS — allow requests from the React frontends (ports 3000 and 3001)
app.use(cors({
  origin: true,
  credentials: true
}));

// Parse incoming JSON bodies
app.use(express.json());

// Parse URL-encoded bodies (form data)
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images as static files at /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/users', userRoutes);
app.use('/api/accommodations', accommodationRoutes);
app.use('/api/reservations', reservationRoutes);

// ─── Health check route ───────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Airbnb Clone API is running' });
});

// ─── 404 handler (unknown routes) ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ─── Global error handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack || err.message);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal server error',
    // Only include stack trace in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ─── MongoDB connection + server start ───────────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅  Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀  Server running on port ${PORT}`);
      console.log(`📁  Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    console.error('❌  MongoDB connection failed:', err.message);
    process.exit(1);
  });

module.exports = app;
