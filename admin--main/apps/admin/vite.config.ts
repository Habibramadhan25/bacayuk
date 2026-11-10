import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Saat dev server lokal digunakan oleh proxy /admin, gunakan '/admin/'.
  // Saat production build (Vercel deployment), gunakan '/' agar seluruh asset di-load tanpa 404.
  base: command === 'serve' ? '/admin/' : '/',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 5173,
    },
  },
}))
