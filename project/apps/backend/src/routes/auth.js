const express = require('express');
const { query } = require('../../database/connection');
const { hashPassword, verifyPassword } = require('../utils/hash');
const { ok, fail, makeId } = require('../utils/helpers');

const router = express.Router();

// --- Admin ---
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return fail(res, 400, 'Username dan password wajib diisi');

    const rows = await query('SELECT * FROM admins WHERE username = ? LIMIT 1', [String(username).trim()]);
    if (!rows.length) return fail(res, 401, 'Username atau password salah');

    const admin = rows[0];
    if (!verifyPassword(password, admin.password_hash)) return fail(res, 401, 'Username atau password salah');

    return ok(res, {
      id: admin.id,
      username: admin.username,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      avatarUrl: admin.avatar_url || null,
      timezone: admin.timezone || 'WIB',
      type: 'admin',
    }, 'Login admin berhasil');
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

router.get('/admin/profile', async (req, res) => {
  try {
    const id = req.query.id || 'admin1';
    const rows = await query('SELECT id, username, name, email, role, avatar_url AS avatarUrl, timezone, created_at AS createdAt, updated_at AS updatedAt FROM admins WHERE id = ? LIMIT 1', [id]);
    if (!rows.length) return fail(res, 404, 'Admin tidak ditemukan');
    return ok(res, rows[0]);
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

router.put('/admin/profile', async (req, res) => {
  try {
    const { id = 'admin1', name, email, role, avatarUrl, timezone } = req.body || {};
    const rows = await query('SELECT id FROM admins WHERE id = ? LIMIT 1', [id]);
    if (!rows.length) return fail(res, 404, 'Admin tidak ditemukan');

    await query(
      `UPDATE admins SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        role = COALESCE(?, role),
        avatar_url = ?,
        timezone = COALESCE(?, timezone)
       WHERE id = ?`,
      [name ?? null, email ?? null, role ?? null, avatarUrl !== undefined ? avatarUrl : null, timezone ?? null, id]
    );
    const updated = await query('SELECT id, username, name, email, role, avatar_url AS avatarUrl, timezone FROM admins WHERE id = ? LIMIT 1', [id]);
    return ok(res, updated[0], 'Profil admin berhasil diperbarui');
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

router.post('/admin/change-password', async (req, res) => {
  try {
    const { id = 'admin1', currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) return fail(res, 400, 'Password saat ini dan password baru wajib diisi');
    if (String(newPassword).trim().length < 8) return fail(res, 400, 'Password baru minimal 8 karakter');

    const rows = await query('SELECT * FROM admins WHERE id = ? LIMIT 1', [id]);
    if (!rows.length) return fail(res, 404, 'Admin tidak ditemukan');
    const admin = rows[0];

    if (!verifyPassword(currentPassword, admin.password_hash)) return fail(res, 401, 'Password saat ini salah');

    await query('UPDATE admins SET password_hash = ? WHERE id = ?', [hashPassword(newPassword), id]);
    return ok(res, null, 'Password berhasil diperbarui');
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

// --- Student / Siswa ---
router.post('/student/register', async (req, res) => {
  try {
    const { username, name, email, password, school } = req.body || {};
    if (!username || !name || !password) return fail(res, 400, 'Username, nama, dan password wajib diisi');
    if (String(password).length < 4) return fail(res, 400, 'Password minimal 4 karakter');

    const cleanUsername = String(username).trim().toLowerCase();
    const existing = await query('SELECT id FROM students WHERE username = ? LIMIT 1', [cleanUsername]);
    if (existing.length) return fail(res, 409, 'Username sudah terdaftar');

    const id = makeId('u');
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(String(name).trim())}&background=8b5e34&color=fff&rounded=true`;
    await query(
      `INSERT INTO students (id, username, name, email, password_hash, school, avatar_url, join_date, books_read, books_completed, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 0, 0, 'Active')`,
      [id, cleanUsername, String(name).trim(), email || null, hashPassword(password), school || 'Sekolah', avatar]
    );

    const user = { id, username: cleanUsername, name: String(name).trim(), email: email || null, school: school || 'Sekolah', avatarUrl: avatar, booksRead: 0, booksCompleted: 0, status: 'Active' };
    return res.status(201).json({ success: true, message: 'Registrasi siswa berhasil', data: user });
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

router.post('/student/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return fail(res, 400, 'Username dan password wajib diisi');

    const identifier = String(username).trim().toLowerCase();
    const rows = await query('SELECT * FROM students WHERE username = ? OR email = ? LIMIT 1', [identifier, identifier]);
    if (!rows.length) return fail(res, 401, 'Akun tidak ditemukan atau password salah');

    const s = rows[0];
    if (s.status === 'Inactive') return fail(res, 403, 'Akun tidak aktif');
    if (s.password_hash) {
      if (!verifyPassword(password, s.password_hash)) return fail(res, 401, 'Password salah');
    } else {
      // akun lama/seed tanpa password: izinkan jika panjang >= 4 (kompatibel perilaku lama)
      if (String(password).length < 4) return fail(res, 401, 'Password salah');
    }

    return ok(res, {
      id: s.id,
      username: s.username,
      name: s.name,
      email: s.email,
      school: s.school || 'Sekolah',
      avatarUrl: s.avatar_url,
      booksRead: s.books_read || 0,
      booksCompleted: s.books_completed || 0,
      status: s.status,
      type: 'student',
    }, 'Login siswa berhasil');
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

router.get('/student/profile/:id', async (req, res) => {
  try {
    const rows = await query(
      'SELECT id, username, name, email, school, avatar_url AS avatarUrl, join_date AS joinDate, books_read AS booksRead, books_completed AS booksCompleted, status FROM students WHERE id = ? LIMIT 1',
      [req.params.id]
    );
    if (!rows.length) return fail(res, 404, 'Siswa tidak ditemukan');
    return ok(res, rows[0]);
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

router.put('/student/profile/:id', async (req, res) => {
  try {
    const { name, avatarUrl, school, email } = req.body || {};
    const id = req.params.id;
    const rows = await query('SELECT id FROM students WHERE id = ? LIMIT 1', [id]);
    if (!rows.length) return fail(res, 404, 'Siswa tidak ditemukan');
    await query(
      `UPDATE students SET name = COALESCE(?, name), avatar_url = COALESCE(?, avatar_url), school = COALESCE(?, school), email = COALESCE(?, email) WHERE id = ?`,
      [name ?? null, avatarUrl ?? null, school ?? null, email ?? null, id]
    );
    const updated = await query('SELECT id, username, name, email, school, avatar_url AS avatarUrl, books_read AS booksRead, books_completed AS booksCompleted, status FROM students WHERE id = ? LIMIT 1', [id]);
    return ok(res, updated[0], 'Profil siswa berhasil diperbarui');
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

module.exports = router;
