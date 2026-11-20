const express = require('express');
const { query } = require('../../database/connection');
const { ok, fail, makeId } = require('../utils/helpers');

const router = express.Router();

function mapCategory(r) {
  return { id: r.id, name: r.name, bookCount: Number(r.book_count || 0) };
}

router.get('/', async (_req, res) => {
  try {
    const rows = await query('SELECT id, name, book_count FROM categories ORDER BY name ASC');
    return ok(res, rows.map(mapCategory));
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

router.post('/', async (req, res) => {
  try {
    const { id, name, bookCount } = req.body || {};
    if (!name || !String(name).trim()) return fail(res, 400, 'Nama kategori wajib diisi');
    const cid = id || makeId('c');
    await query('INSERT INTO categories (id, name, book_count) VALUES (?, ?, ?)', [cid, String(name).trim(), Number(bookCount || 0)]);
    const rows = await query('SELECT id, name, book_count FROM categories WHERE id = ? LIMIT 1', [cid]);
    return res.status(201).json({ success: true, message: 'Kategori berhasil ditambahkan', data: mapCategory(rows[0]) });
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, bookCount } = req.body || {};
    const id = req.params.id;
    const exist = await query('SELECT id FROM categories WHERE id = ? LIMIT 1', [id]);
    if (!exist.length) return fail(res, 404, 'Kategori tidak ditemukan');
    await query('UPDATE categories SET name = COALESCE(?, name), book_count = COALESCE(?, book_count) WHERE id = ?', [name ?? null, bookCount !== undefined ? Number(bookCount) : null, id]);
    const rows = await query('SELECT id, name, book_count FROM categories WHERE id = ? LIMIT 1', [id]);
    return ok(res, mapCategory(rows[0]), 'Kategori berhasil diperbarui');
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const exist = await query('SELECT id FROM categories WHERE id = ? LIMIT 1', [id]);
    if (!exist.length) return fail(res, 404, 'Kategori tidak ditemukan');
    await query('DELETE FROM categories WHERE id = ?', [id]);
    return ok(res, null, 'Kategori berhasil dihapus');
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

module.exports = router;
