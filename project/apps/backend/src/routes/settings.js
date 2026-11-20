const express = require('express');
const { query } = require('../../database/connection');
const { ok, fail } = require('../utils/helpers');

const router = express.Router();

// GET /api/settings/admin?id=admin1
router.get('/admin', async (req, res) => {
  try {
    const id = req.query.id || 'admin1';
    const rows = await query('SELECT id, username, name, email, role, avatar_url AS avatarUrl, timezone FROM admins WHERE id = ? LIMIT 1', [id]);
    if (!rows.length) return fail(res, 404, 'Admin tidak ditemukan');
    return ok(res, rows[0]);
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

// PUT /api/settings/admin  { id, timezone, name, email, avatarUrl }
router.put('/admin', async (req, res) => {
  try {
    const { id = 'admin1', timezone, name, email, avatarUrl } = req.body || {};
    const exist = await query('SELECT id FROM admins WHERE id = ? LIMIT 1', [id]);
    if (!exist.length) return fail(res, 404, 'Admin tidak ditemukan');
    await query(
      'UPDATE admins SET timezone = COALESCE(?, timezone), name = COALESCE(?, name), email = COALESCE(?, email), avatar_url = COALESCE(?, avatar_url) WHERE id = ?',
      [timezone ?? null, name ?? null, email ?? null, avatarUrl ?? null, id]
    );
    const rows = await query('SELECT id, username, name, email, role, avatar_url AS avatarUrl, timezone FROM admins WHERE id = ? LIMIT 1', [id]);
    return ok(res, rows[0], 'Pengaturan admin diperbarui');
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

module.exports = router;
