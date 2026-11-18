import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(() => ({
  base: '/',
  plugins: [react()],
  define: {
    'process.env.SERVER_URL': JSON.stringify(process.env.SERVER_URL || ''),
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
}))
