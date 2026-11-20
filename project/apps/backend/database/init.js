const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
dotenv.config();

async function initDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'bacayuk_db';

  console.log(`[DB] Inisialisasi database MySQL: ${database}`);

  let conn;
  try {
    conn = await mysql.createConnection({ host, port, user, password, multipleStatements: true });
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await conn.query(`USE \`${database}\`;`);

    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) throw new Error(`schema.sql tidak ditemukan di ${schemaPath}`);
    const sql = fs.readFileSync(schemaPath, 'utf8');
    await conn.query(sql);

    console.log('[DB] Schema & seed data berhasil diterapkan.');
    await conn.end();
    return true;
  } catch (err) {
    console.error('[DB] Gagal inisialisasi database:', err.message || err.code || err);
    if (err.code === 'ECONNREFUSED') {
      console.error('[DB] MySQL tidak dapat diakses. Pastikan service MySQL (XAMPP/Laragon/MySQL Server) sudah berjalan dan konfigurasi .env benar.');
    }
    if (conn) try { await conn.end(); } catch {}
    return false;
  }
}

if (require.main === module) {
  initDatabase().then((ok) => process.exit(ok ? 0 : 1));
}

module.exports = { initDatabase };
