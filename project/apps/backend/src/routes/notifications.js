const express = require('express');
const { query } = require('../../database/connection');
const { ok, fail, makeId } = require('../utils/helpers');

const router = express.Router();

function mapNotif(r) {
  return {
    id: r.id,
    title: r.title,
    message: r.message,
    type: r.type,
    audience: r.audience,
    createdAt: r.created_at,
    readByAdmin: !!r.read_by_admin,
    readBySiswa: !!r.read_by_siswa,
  };
}

router.get('/', async (req, res) => {
  try {
    const { audience } = req.query; // admin | siswa | all(optional)
    let sql = 'SELECT * FROM notifications';
    const params = [];
    if (audience && audience !== 'all') {
      sql += ' WHERE audience = ? OR audience = "all"';
      params.push(audience);
    }
    sql += ' ORDER BY created_at DESC LIMIT 50';
    const rows = await query(sql, params);
    return ok(res, rows.map(mapNotif));
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, message, type, audience } = req.body || {};
    if (!title || !message) return fail(res, 400, 'title dan message wajib diisi');
    const aud = audience || 'all';
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const readByAdmin = aud === 'siswa' ? 1 : 0;
    const readBySiswa = aud === 'admin' ? 1 : 0;
    await query(
      'INSERT INTO notifications (id, title, message, type, audience, created_at, read_by_admin, read_by_siswa) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)',
      [id, title, message, type || 'system', aud, readByAdmin, readBySiswa]
    );
    const rows = await query('SELECT * FROM notifications WHERE id = ? LIMIT 1', [id]);
    return res.status(201).json({ success: true, message: 'Notifikasi dibuat', data: mapNotif(rows[0]) });
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

router.post('/mark-read', async (req, res) => {
  try {
    const { id, audience } = req.body || {};
    if (!id || !audience) return fail(res, 400, 'id dan audience wajib diisi');
    if (audience === 'admin') await query('UPDATE notifications SET read_by_admin = 1 WHERE id = ?', [id]);
    else if (audience === 'siswa') await query('UPDATE notifications SET read_by_siswa = 1 WHERE id = ?', [id]);
    else return fail(res, 400, 'audience tidak valid');
    const rows = await query('SELECT * FROM notifications WHERE id = ? LIMIT 1', [id]);
    return ok(res, rows.length ? mapNotif(rows[0]) : null, 'Notifikasi ditandai dibaca');
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

router.post('/mark-all-read', async (req, res) => {
  try {
    const { audience } = req.body || {};
    if (audience === 'admin') await query('UPDATE notifications SET read_by_admin = 1 WHERE audience IN ("admin","all")');
    else if (audience === 'siswa') await query('UPDATE notifications SET read_by_siswa = 1 WHERE audience IN ("siswa","all")');
    else return fail(res, 400, 'audience tidak valid');
    return ok(res, null, 'Semua notifikasi ditandai dibaca');
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

module.exports = router;
