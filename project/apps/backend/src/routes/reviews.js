const express = require('express');
const { query } = require('../../database/connection');
const { ok, fail, makeId } = require('../utils/helpers');

const router = express.Router();

function mapReview(r) {
  return { id: r.id, bookId: r.book_id, studentId: r.student_id, name: r.reviewer_name, rating: Number(r.rating), text: r.text, date: r.created_at };
}

router.get('/', async (req, res) => {
  try {
    const { bookId } = req.query;
    let sql = 'SELECT * FROM reviews';
    const params = [];
    if (bookId) { sql += ' WHERE book_id = ?'; params.push(bookId); }
    sql += ' ORDER BY created_at DESC';
    const rows = await query(sql, params);
    return ok(res, rows.map(mapReview));
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

router.post('/', async (req, res) => {
  try {
    const { bookId, studentId, name, rating, text } = req.body || {};
    if (!bookId || !rating || !text) return fail(res, 400, 'bookId, rating, dan text wajib diisi');
    const bookRows = await query('SELECT id FROM books WHERE id = ? LIMIT 1', [bookId]);
    if (!bookRows.length) return fail(res, 404, 'Buku tidak ditemukan');

    const id = makeId('r');
    const r = Math.min(5, Math.max(1, Number(rating)));
    await query(
      'INSERT INTO reviews (id, book_id, student_id, reviewer_name, rating, text, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [id, bookId, studentId || null, (name || 'Siswa').toString().trim() || 'Siswa', r, String(text).trim()]
    );

    const avgRows = await query('SELECT AVG(rating) AS avgRating, COUNT(*) AS cnt FROM reviews WHERE book_id = ?', [bookId]);
    const avg = Number(avgRows[0]?.avgRating || 0);
    await query('UPDATE books SET rating = ? WHERE id = ?', [Number(avg.toFixed(1)), bookId]);

    const rows = await query('SELECT * FROM reviews WHERE id = ? LIMIT 1', [id]);
    return res.status(201).json({ success: true, message: 'Ulasan berhasil ditambahkan', data: { review: mapReview(rows[0]), bookRating: Number(avg.toFixed(1)) } });
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const rows = await query('SELECT * FROM reviews WHERE id = ? LIMIT 1', [id]);
    if (!rows.length) return fail(res, 404, 'Ulasan tidak ditemukan');
    const bookId = rows[0].book_id;
    await query('DELETE FROM reviews WHERE id = ?', [id]);
    const avgRows = await query('SELECT AVG(rating) AS avgRating FROM reviews WHERE book_id = ?', [bookId]);
    const avg = avgRows[0]?.avgRating == null ? 0 : Number(Number(avgRows[0].avgRating).toFixed(1));
    await query('UPDATE books SET rating = ? WHERE id = ?', [avg, bookId]);
    return ok(res, { bookRating: avg }, 'Ulasan berhasil dihapus');
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

module.exports = router;
