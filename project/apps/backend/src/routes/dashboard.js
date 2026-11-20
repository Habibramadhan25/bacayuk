const express = require('express');
const { query } = require('../../database/connection');
const { ok, fail } = require('../utils/helpers');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const b = await query('SELECT COUNT(*) AS total, COALESCE(SUM(readers),0) AS totalReads, COALESCE(AVG(NULLIF(rating,0)),0) AS avgRating FROM books');
    const u = await query('SELECT COUNT(*) AS total, COALESCE(SUM(books_completed),0) AS completed FROM students');
    const c = await query('SELECT COUNT(*) AS total FROM categories');
    const h = await query('SELECT COUNT(*) AS total FROM reading_history');
    const r = await query('SELECT COUNT(*) AS total FROM reviews');

    return ok(res, {
      books: Number(b[0]?.total || 0),
      users: Number(u[0]?.total || 0),
      categories: Number(c[0]?.total || 0),
      reads: Number(b[0]?.totalReads || 0),
      completed: Number(u[0]?.completed || 0),
      averageRating: Number(Number(b[0]?.avgRating || 0).toFixed(1)),
      historyCount: Number(h[0]?.total || 0),
      reviewCount: Number(r[0]?.total || 0),
    });
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

module.exports = router;
