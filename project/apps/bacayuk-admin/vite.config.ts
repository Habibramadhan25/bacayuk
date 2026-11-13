import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.BACKEND_URL': JSON.stringify(process.env.BACKEND_URL || ''),
    'process.env.SERVER_URL': JSON.stringify(process.env.SERVER_URL || ''),
  },
})
