# Deploy ke Vercel (1 link: Admin + Siswa)

Repo ini sekarang dikonfigurasi agar **1 project Vercel** melayani aplikasi gabungan **Admin** dan **Siswa** dari:
- `project/apps/bacayuk-admin`

## Opsi A — Deploy dari root repo (paling sederhana)
`vercel.json` di root sudah mengarah ke build app gabungan.

1. Import repo ke Vercel sebagai **satu project**.
2. Biarkan **Root Directory** kosong (root repo).
3. Vercel akan memakai pengaturan dari `vercel.json` root:
   - Install: `npm install --prefix project/apps/bacayuk-admin`
   - Build: `npm run build --prefix project/apps/bacayuk-admin`
   - Output: `project/apps/bacayuk-admin/dist`
4. Deploy.

## Opsi B — Deploy dengan Root Directory ke app
1. Import repo ke Vercel sebagai **satu project**.
2. Set **Root Directory** ke `project/apps/bacayuk-admin`.
3. Framework: Vite, Build: `npm run build`, Output: `dist`.
4. `project/apps/bacayuk-admin/vercel.json` sudah berisi rewrite SPA (`/(.*) -> /index.html`).

## URL setelah deploy (1 link)
- Admin: `/login`, `/`, `/books`, dll.
- Siswa: `/siswa/login`, `/siswa`, `/siswa/katalog`, dll.

## Catatan
- Pastikan **tidak** membuat project Vercel terpisah untuk `admin--main` jika tujuanmu hanya 1 link, agar tidak muncul deployment/link kedua.
- Jika butuh backend/API, set environment variable dan sesuaikan endpoint sesuai layanan yang kamu deploy terpisah.
- `admin--main/` dan `project/apps/server|backend|mobile` adalah bagian lain dari repo; untuk kebutuhan "1 web link admin+siswa", fokus deploy ke `project/apps/bacayuk-admin`.
