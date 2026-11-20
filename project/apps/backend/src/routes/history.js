const express = require('express');
const { query } = require('../../database/connection');
const { ok, fail, makeId } = require('../utils/helpers');

const router = express.Router();

function mapHistory(r) {
  return {
    id: r.id,
    studentId: r.student_id,
    bookId: r.book_id,
    bookTitle: r.book_title,
    author: r.author,
    coverUrl: r.cover_url,
    progress: Number(r.progress || 0),
    currentPage: Number(r.current_page || 0),
    totalPages: Number(r.total_pages || 0),
    lastRead: r.last_read,
    status: r.status,
  };
}

router.get('/', async (req, res) => {
  try {
    const { studentId } = req.query;
    let sql = 'SELECT * FROM reading_history';
    const params = [];
    if (studentId) { sql += ' WHERE student_id = ?'; params.push(studentId); }
    sql += ' ORDER BY last_read DESC';
    const rows = await query(sql, params);
    return ok(res, rows.map(mapHistory));
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

router.post('/', async (req, res) => {
  try {
    const h = req.body || {};
    if (!h.bookId) return fail(res, 400, 'bookId wajib diisi');
    const id = h.id || makeId('h');
    await query(
      `INSERT INTO reading_history (id, student_id, book_id, book_title, author, cover_url, progress, current_page, total_pages, last_read, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, h.studentId || null, h.bookId, h.bookTitle || 'Buku', h.author || '', h.coverUrl || null, Number(h.progress || 0), Number(h.currentPage || 0), Number(h.totalPages || 0), h.lastRead ? new Date(h.lastRead) : new Date(), h.status || 'Sedang Dibaca']
    );
    const rows = await query('SELECT * FROM reading_history WHERE id = ? LIMIT 1', [id]);
    return res.status(201).json({ success: true, message: 'Riwayat berhasil disimpan', data: mapHistory(rows[0]) });
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

// Upsert by studentId+bookId (untuk progress baca)
router.post('/upsert', async (req, res) => {
  try {
    const h = req.body || {};
    if (!h.bookId) return fail(res, 400, 'bookId wajib diisi');
    const studentId = h.studentId || null;
    let existing = [];
    if (studentId) {
      existing = await query('SELECT id FROM reading_history WHERE student_id = ? AND book_id = ? LIMIT 1', [studentId, h.bookId]);
    }
    if (existing.length) {
      const id = existing[0].id;
      await query(
        `UPDATE reading_history SET book_title = COALESCE(?, book_title), author = COALESCE(?, author), cover_url = COALESCE(?, cover_url),
         progress = ?, current_page = ?, total_pages = COALESCE(?, total_pages), last_read = ?, status = COALESCE(?, status)
         WHERE id = ?`,
        [h.bookTitle ?? null, h.author ?? null, h.coverUrl ?? null, Number(h.progress || 0), Number(h.currentPage || 0), h.totalPages ?? null, h.lastRead ? new Date(h.lastRead) : new Date(), h.status ?? null, id]
      );
      const rows = await query('SELECT * FROM reading_history WHERE id = ? LIMIT 1', [id]);
      return ok(res, mapHistory(rows[0]), 'Progress baca diperbarui');
    } else {
      const id = h.id || makeId('h');
      await query(
        `INSERT INTO reading_history (id, student_id, book_id, book_title, author, cover_url, progress, current_page, total_pages, last_read, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, studentId, h.bookId, h.bookTitle || 'Buku', h.author || '', h.coverUrl || null, Number(h.progress || 0), Number(h.currentPage || 0), Number(h.totalPages || 0), h.lastRead ? new Date(h.lastRead) : new Date(), h.status || 'Sedang Dibaca']
      );
      const rows = await query('SELECT * FROM reading_history WHERE id = ? LIMIT 1', [id]);
      return res.status(201).json({ success: true, message: 'Progress baca disimpan', data: mapHistory(rows[0]) });
    }
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const h = req.body || {};
    const exist = await query('SELECT id FROM reading_history WHERE id = ? LIMIT 1', [id]);
    if (!exist.length) return fail(res, 404, 'Riwayat tidak ditemukan');
    await query(
      `UPDATE reading_history SET progress = COALESCE(?, progress), current_page = COALESCE(?, current_page), total_pages = COALESCE(?, total_pages),
       last_read = COALESCE(?, last_read), status = COALESCE(?, status), book_title = COALESCE(?, book_title), author = COALESCE(?, author), cover_url = COALESCE(?, cover_url)
       WHERE id = ?`,
      [h.progress ?? null, h.currentPage ?? null, h.totalPages ?? null, h.lastRead ? new Date(h.lastRead) : null, h.status ?? null, h.bookTitle ?? null, h.author ?? null, h.coverUrl ?? null, id]
    );
    const rows = await query('SELECT * FROM reading_history WHERE id = ? LIMIT 1', [id]);
    return ok(res, mapHistory(rows[0]), 'Riwayat diperbarui');
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM reading_history WHERE id = ?', [req.params.id]);
    return ok(res, null, 'Riwayat dihapus');
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

module.exports = router;
