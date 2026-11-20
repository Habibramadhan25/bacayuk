const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
dotenv.config();

const { testConnection } = require('../database/connection');

const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const categoryRoutes = require('./routes/categories');
const userRoutes = require('./routes/users');
const reviewRoutes = require('./routes/reviews');
const historyRoutes = require('./routes/history');
const favoriteRoutes = require('./routes/favorites');
const notificationRoutes = require('./routes/notifications');
const activityRoutes = require('./routes/activity');
const dashboardRoutes = require('./routes/dashboard');
const settingsRoutes = require('./routes/settings');

const app = express();

const origins = (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({ origin: origins.length ? origins : true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/', (_req, res) => {
  res.json({
    name: 'BacaYuk Backend API',
    status: 'running',
    database: 'MySQL',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      books: '/api/books',
      categories: '/api/categories',
      users: '/api/users',
      reviews: '/api/reviews',
      history: '/api/history',
      favorites: '/api/favorites',
      notifications: '/api/notifications',
      activity: '/api/activity',
      dashboard: '/api/dashboard',
      settings: '/api/settings'
    }
  });
});

app.get('/api/health', async (_req, res) => {
  const dbConnected = await testConnection();
  res.json({ success: true, status: 'ok', dbConnected, timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route tidak ditemukan: ${req.method} ${req.originalUrl}` });
});

app.use((err, _req, res, _next) => {
  console.error('[APP ERROR]', err);
  res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server', error: err.message });
});

module.exports = app;
