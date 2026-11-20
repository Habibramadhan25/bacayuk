const express = require('express');
const { query } = require('../../database/connection');
const { ok, fail, makeId } = require('../utils/helpers');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { studentId } = req.query;
    if (!studentId) return fail(res, 400, 'studentId wajib diisi');
    const rows = await query('SELECT book_id AS bookId FROM favorites WHERE student_id = ? ORDER BY created_at DESC', [studentId]);
    return ok(res, rows.map(r => r.bookId));
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

router.post('/toggle', async (req, res) => {
  try {
    const { studentId, bookId } = req.body || {};
    if (!studentId || !bookId) return fail(res, 400, 'studentId dan bookId wajib diisi');
    const exist = await query('SELECT id FROM favorites WHERE student_id = ? AND book_id = ? LIMIT 1', [studentId, bookId]);
    if (exist.length) {
      await query('DELETE FROM favorites WHERE student_id = ? AND book_id = ?', [studentId, bookId]);
      return ok(res, { isFavorite: false }, 'Dihapus dari favorit');
    } else {
      await query('INSERT INTO favorites (id, student_id, book_id) VALUES (?, ?, ?)', [makeId('fav'), studentId, bookId]);
      return ok(res, { isFavorite: true }, 'Ditambahkan ke favorit');
    }
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

router.post('/', async (req, res) => {
  try {
    const { studentId, bookId } = req.body || {};
    if (!studentId || !bookId) return fail(res, 400, 'studentId dan bookId wajib diisi');
    const exist = await query('SELECT id FROM favorites WHERE student_id = ? AND book_id = ? LIMIT 1', [studentId, bookId]);
    if (exist.length) return ok(res, { isFavorite: true }, 'Sudah ada di favorit');
    await query('INSERT INTO favorites (id, student_id, book_id) VALUES (?, ?, ?)', [makeId('fav'), studentId, bookId]);
    return res.status(201).json({ success: true, message: 'Ditambahkan ke favorit', data: { isFavorite: true } });
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

router.delete('/', async (req, res) => {
  try {
    const { studentId, bookId } = req.body || req.query || {};
    if (!studentId || !bookId) return fail(res, 400, 'studentId dan bookId wajib diisi');
    await query('DELETE FROM favorites WHERE student_id = ? AND book_id = ?', [studentId, bookId]);
    return ok(res, { isFavorite: false }, 'Dihapus dari favorit');
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

module.exports = router;
