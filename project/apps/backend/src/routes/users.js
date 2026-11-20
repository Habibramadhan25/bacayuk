const express = require('express');
const { query } = require('../../database/connection');
const { ok, fail } = require('../utils/helpers');

const router = express.Router();

function mapUser(r) {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    username: r.username,
    joinDate: r.join_date,
    booksRead: Number(r.books_read || 0),
    booksCompleted: Number(r.books_completed || 0),
    status: r.status,
    avatar: r.avatar_url,
  };
}

// GET /api/users (admin: daftar anggota/siswa)
router.get('/', async (_req, res) => {
  try {
    const rows = await query('SELECT id, name, email, username, join_date, books_read, books_completed, status, avatar_url FROM students ORDER BY join_date DESC');
    return ok(res, rows.map(mapUser));
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const rows = await query('SELECT id, name, email, username, join_date, books_read, books_completed, status, avatar_url FROM students WHERE id = ? LIMIT 1', [req.params.id]);
    if (!rows.length) return fail(res, 404, 'Pengguna tidak ditemukan');
    return ok(res, mapUser(rows[0]));
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const u = req.body || {};
    const exist = await query('SELECT id FROM students WHERE id = ? LIMIT 1', [id]);
    if (!exist.length) return fail(res, 404, 'Pengguna tidak ditemukan');
    await query(
      `UPDATE students SET
        name = COALESCE(?, name), email = COALESCE(?, email), username = COALESCE(?, username),
        status = COALESCE(?, status), avatar_url = COALESCE(?, avatar_url),
        books_read = COALESCE(?, books_read), books_completed = COALESCE(?, books_completed)
       WHERE id = ?`,
      [u.name ?? null, u.email ?? null, u.username ?? null, u.status ?? null, (u.avatar ?? u.avatarUrl) ?? null, u.booksRead ?? null, u.booksCompleted ?? null, id]
    );
    const rows = await query('SELECT id, name, email, username, join_date, books_read, books_completed, status, avatar_url FROM students WHERE id = ? LIMIT 1', [id]);
    return ok(res, mapUser(rows[0]), 'Pengguna berhasil diperbarui');
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const exist = await query('SELECT id FROM students WHERE id = ? LIMIT 1', [id]);
    if (!exist.length) return fail(res, 404, 'Pengguna tidak ditemukan');
    await query('DELETE FROM students WHERE id = ?', [id]);
    return ok(res, null, 'Pengguna berhasil dihapus');
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

module.exports = router;
