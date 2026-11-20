const express = require('express');
const { query } = require('../../database/connection');
const { ok, fail, makeId } = require('../utils/helpers');

const router = express.Router();

function mapActivity(r) {
  return { id: r.id, user: r.actor, action: r.action, target: r.target, time: r.time, status: r.status };
}

router.get('/', async (_req, res) => {
  try {
    const rows = await query('SELECT * FROM activity_logs ORDER BY time DESC LIMIT 200');
    return ok(res, rows.map(mapActivity));
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

router.post('/', async (req, res) => {
  try {
    const { user, action, target, status, time } = req.body || {};
    if (!user || !action || !target) return fail(res, 400, 'user, action, dan target wajib diisi');
    const id = makeId('a');
    await query('INSERT INTO activity_logs (id, actor, action, target, time, status) VALUES (?, ?, ?, ?, ?, ?)', [id, user, action, target, time ? new Date(time) : new Date(), status || 'Success']);
    const rows = await query('SELECT * FROM activity_logs WHERE id = ? LIMIT 1', [id]);
    return res.status(201).json({ success: true, message: 'Aktivitas dicatat', data: mapActivity(rows[0]) });
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

module.exports = router;
