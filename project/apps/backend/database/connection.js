const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bacayuk_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
  timezone: '+07:00',
});

async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log(`[DB] Terhubung ke MySQL: ${process.env.DB_NAME || 'bacayuk_db'}`);
    conn.release();
    return true;
  } catch (err) {
    console.error('[DB] Gagal terhubung ke MySQL:', err.message || err.code || err);
    console.error('[DB] Pastikan MySQL (XAMPP/Laragon/MySQL Server) berjalan dan konfigurasi .env sesuai.');
    return false;
  }
}

module.exports = { pool, query, testConnection };
