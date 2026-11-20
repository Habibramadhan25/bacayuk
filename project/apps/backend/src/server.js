const app = require('./app');
const { testConnection } = require('../database/connection');
const { initDatabase } = require('../database/init');

const PORT = Number(process.env.PORT) || 5000;

(async () => {
  const ok = await testConnection();
  if (ok) {
    try {
      await initDatabase();
    } catch (e) {
      console.warn('[DB] Auto-init gagal:', e.message);
    }
  } else {
    console.warn('[DB] Lewati auto-init karena koneksi MySQL belum tersedia. Jalankan MySQL lalu gunakan: npm run db:init');
  }

  app.listen(PORT, () => {
    console.log(`[SERVER] BacaYuk Backend berjalan di http://localhost:${PORT}`);
  });
})();
