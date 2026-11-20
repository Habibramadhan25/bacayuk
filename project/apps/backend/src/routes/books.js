const express = require('express');
const { query } = require('../../database/connection');
const { ok, fail, makeId } = require('../utils/helpers');

const router = express.Router();

function mapBook(r) {
  return {
    id: r.id,
    title: r.title,
    author: r.author,
    category: r.category,
    year: r.year,
    publisher: r.publisher,
    isbn: r.isbn,
    status: r.status,
    rating: Number(r.rating || 0),
    readers: Number(r.readers || 0),
    dateAdded: r.date_added,
    coverUrl: r.cover_url,
    description: r.description,
  };
}

// GET /api/books?status=Published&category=Fiksi&q=...
router.get('/', async (req, res) => {
  try {
    const { status, category, q } = req.query;
    let sql = 'SELECT * FROM books WHERE 1=1';
    const params = [];
    if (status) { sql += ' AND status = ?'; params.push(status); }
    if (category) { sql += ' AND category = ?'; params.push(category); }
    if (q) {
      sql += ' AND (title LIKE ? OR author LIKE ? OR category LIKE ? OR isbn LIKE ?)';
      const like = `%${q}%`;
      params.push(like, like, like, like);
    }
    sql += ' ORDER BY date_added DESC, title ASC';
    const rows = await query(sql, params);
    return ok(res, rows.map(mapBook));
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM books WHERE id = ? LIMIT 1', [req.params.id]);
    if (!rows.length) return fail(res, 404, 'Buku tidak ditemukan');
    return ok(res, mapBook(rows[0]));
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

router.post('/', async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.title || !b.author) return fail(res, 400, 'Judul dan penulis wajib diisi');
    const id = b.id || makeId('b');
    await query(
      `INSERT INTO books (id, title, author, category, year, publisher, isbn, status, rating, readers, date_added, cover_url, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, b.title, b.author, b.category || 'Umum', b.year || null, b.publisher || null, b.isbn || null, b.status || 'Draft', b.rating || 0, b.readers || 0, b.dateAdded ? new Date(b.dateAdded) : new Date(), b.coverUrl || null, b.description || null]
    );
    const rows = await query('SELECT * FROM books WHERE id = ? LIMIT 1', [id]);
    return res.status(201).json({ success: true, message: 'Buku berhasil ditambahkan', data: mapBook(rows[0]) });
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const b = req.body || {};
    const exist = await query('SELECT id FROM books WHERE id = ? LIMIT 1', [id]);
    if (!exist.length) return fail(res, 404, 'Buku tidak ditemukan');
    await query(
      `UPDATE books SET
        title = COALESCE(?, title), author = COALESCE(?, author), category = COALESCE(?, category),
        year = COALESCE(?, year), publisher = COALESCE(?, publisher), isbn = COALESCE(?, isbn),
        status = COALESCE(?, status), rating = COALESCE(?, rating), readers = COALESCE(?, readers),
        date_added = COALESCE(?, date_added), cover_url = COALESCE(?, cover_url), description = COALESCE(?, description)
       WHERE id = ?`,
      [b.title ?? null, b.author ?? null, b.category ?? null, b.year ?? null, b.publisher ?? null, b.isbn ?? null, b.status ?? null, b.rating ?? null, b.readers ?? null, b.dateAdded ? new Date(b.dateAdded) : null, b.coverUrl ?? null, b.description ?? null, id]
    );
    const rows = await query('SELECT * FROM books WHERE id = ? LIMIT 1', [id]);
    return ok(res, mapBook(rows[0]), 'Buku berhasil diperbarui');
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const exist = await query('SELECT id FROM books WHERE id = ? LIMIT 1', [id]);
    if (!exist.length) return fail(res, 404, 'Buku tidak ditemukan');
    await query('DELETE FROM books WHERE id = ?', [id]);
    return ok(res, null, 'Buku berhasil dihapus');
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

module.exports = router;
