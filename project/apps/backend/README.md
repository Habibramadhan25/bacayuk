# BacaYuk Backend API (MySQL)

Backend REST API untuk aplikasi **BacaYuk** (Admin & Siswa) yang ada di `project/apps/bacayuk-admin`.

Backend ini dibuat untuk mencakup fitur/halaman utama aplikasi, antara lain:
- **Autentikasi**: login admin, ganti password admin, profil admin; register/login/profil siswa.
- **Buku**: daftar/detail/tambah/ubah/hapus buku (admin & katalog siswa).
- **Kategori**: CRUD kategori.
- **Pengguna/Anggota (siswa)**: daftar, detail, ubah status/data, hapus.
- **Ulasan/Rating**: tambah ulasan, hitung ulang rating buku.
- **Riwayat/Progress baca**: simpan dan ambil riwayat/progress per siswa.
- **Favorit**: daftar & toggle favorit per siswa.
- **Notifikasi**: buat, ambil per audiens (admin/siswa), tandai dibaca.
- **Aktivitas**: log aktivitas sistem/pengguna.
- **Dashboard**: statistik ringkasan.
- **Pengaturan admin**: profil/timezone.

> Catatan: frontend saat ini masih menggunakan `localStorage` (mock). Backend ini disiapkan agar siap diintegrasikan ke frontend dan ke database MySQL.

## Stack
- Node.js + Express (CommonJS)
- MySQL (`mysql2/promise`)
- dotenv, cors

## Struktur folder
- `src/server.js` — entry server
- `src/app.js` — konfigurasi Express & routing
- `src/routes/` — endpoint API per fitur
- `src/utils/` — helper (hash password, response, dll.)
- `database/connection.js` — koneksi/pool MySQL
- `database/schema.sql` — **skema + seed data MySQL (khusus database)**
- `database/init.js` — script inisialisasi database
- `.env.example` — contoh konfigurasi environment

## Persiapan
1. Pastikan **Node.js** dan **MySQL** (XAMPP/Laragon/MySQL Server) sudah terpasang & berjalan.
2. Masuk ke folder backend:
   ```bash
   cd project/apps/backend
   ```
3. Install dependency:
   ```bash
   npm install
   ```
4. Buat file `.env` dari contoh:
   ```bash
   copy .env.example .env
   ```
   Lalu sesuaikan jika perlu:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=bacayuk_db
   CORS_ORIGIN=http://localhost:5173,http://localhost:4173
   ```

## Bagian Database (MySQL) — khusus
Semua kebutuhan database disiapkan di folder `database/`:
- `database/schema.sql` berisi:
  - `CREATE DATABASE IF NOT EXISTS bacayuk_db`
  - pembuatan tabel: `admins`, `students`, `categories`, `books`, `reading_history`, `reviews`, `favorites`, `notifications`, `activity_logs`
  - relasi/foreign key (mis. riwayat/review/favorit ke siswa & buku)
  - **seed data awal** (admin default, kategori, 21 buku, 5 anggota contoh, riwayat & aktivitas contoh) agar sesuai data aplikasi
- `database/init.js` menjalankan `schema.sql` ke MySQL sesuai `.env`
- `database/connection.js` mengatur pool koneksi MySQL

### Cara membuat/inisialisasi database
Pastikan MySQL aktif, lalu jalankan:
```bash
npm run db:init
```
Script akan membuat database (jika belum ada) dan menerapkan skema + seed data.

### Akun default (seed)
- **Admin**
  - Username: `admin`
  - Password: `admin123` (disimpan sebagai hash di tabel `admins`)
- **Siswa/anggota contoh**: data awal ada di tabel `students` (akun seed dapat dilengkapi password saat registrasi/login flow sesuai kebutuhan).

> Jika Anda ingin membuat database secara manual via phpMyAdmin/MySQL client, jalankan isi `database/schema.sql`.

## Menjalankan server
```bash
npm run dev   # development (node --watch)
# atau
npm start     # production/simple
```
Server default: `http://localhost:5000`

Saat start, server akan mencoba koneksi MySQL dan auto-init schema (jika koneksi tersedia). Anda tetap bisa menjalankan `npm run db:init` secara manual.

## Ringkasan Endpoint API
Base URL: `/api`

### Health & info
- `GET /` — info service
- `GET /api/health` — status & koneksi DB

### Auth (`/api/auth`)
- `POST /api/auth/admin/login` — login admin `{ username, password }`
- `GET /api/auth/admin/profile?id=admin1` — profil admin
- `PUT /api/auth/admin/profile` — update profil admin `{ id?, name?, email?, role?, avatarUrl?, timezone? }`
- `POST /api/auth/admin/change-password` — ganti password `{ id?, currentPassword, newPassword }`
- `POST /api/auth/student/register` — daftar siswa `{ username, name, email?, password, school? }`
- `POST /api/auth/student/login` — login siswa `{ username, password }`
- `GET /api/auth/student/profile/:id` — profil siswa
- `PUT /api/auth/student/profile/:id` — update profil siswa `{ name?, avatarUrl?, school?, email? }`

### Buku (`/api/books`)
- `GET /api/books` — list buku (query: `status`, `category`, `q`)
- `GET /api/books/:id` — detail buku
- `POST /api/books` — tambah buku
- `PUT /api/books/:id` — ubah buku
- `DELETE /api/books/:id` — hapus buku

### Kategori (`/api/categories`)
- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`

### Pengguna/Anggota (`/api/users`)
- `GET /api/users` — daftar siswa/anggota
- `GET /api/users/:id`
- `PUT /api/users/:id` — ubah data/status anggota
- `DELETE /api/users/:id`

### Ulasan/Rating (`/api/reviews`)
- `GET /api/reviews?bookId=...`
- `POST /api/reviews` — `{ bookId, studentId?, name, rating, text }` (otomatis update rating rata-rata buku)
- `DELETE /api/reviews/:id`

### Riwayat/Progress (`/api/history`)
- `GET /api/history?studentId=...`
- `POST /api/history` — tambah riwayat
- `POST /api/history/upsert` — simpan/update progress baca per siswa+buku
- `PUT /api/history/:id`
- `DELETE /api/history/:id`

### Favorit (`/api/favorites`)
- `GET /api/favorites?studentId=...` — daftar id buku favorit
- `POST /api/favorites/toggle` — `{ studentId, bookId }`
- `POST /api/favorites` — tambah favorit
- `DELETE /api/favorites` — hapus favorit `{ studentId, bookId }`

### Notifikasi (`/api/notifications`)
- `GET /api/notifications?audience=admin|siswa`
- `POST /api/notifications` — `{ title, message, type?, audience? }`
- `POST /api/notifications/mark-read` — `{ id, audience }`
- `POST /api/notifications/mark-all-read` — `{ audience }`

### Aktivitas (`/api/activity`)
- `GET /api/activity`
- `POST /api/activity` — `{ user, action, target, status?, time? }`

### Dashboard (`/api/dashboard`)
- `GET /api/dashboard` — statistik ringkasan (total buku, anggota, kategori, pembaca, selesai, rating, dll.)

### Pengaturan (`/api/settings`)
- `GET /api/settings/admin?id=admin1`
- `PUT /api/settings/admin` — `{ id?, timezone?, name?, email?, avatarUrl? }`

## Catatan integrasi
- Respons API menggunakan format umum: `{ success: boolean, data?: ..., message?: ... }`.
- Field data dibuat mengikuti model frontend (`mockData`/halaman) sebisa mungkin (mis. `coverUrl`, `dateAdded`, `bookTitle`, `readByAdmin`, dll.) agar integrasi lebih mudah.
- Keamanan (JWT/session, hashing lebih kuat, validasi lanjutan, upload file terpisah, dsb.) dapat ditingkatkan saat integrasi penuh.
