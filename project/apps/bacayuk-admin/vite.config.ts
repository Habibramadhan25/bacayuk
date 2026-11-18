import path from 'path';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootNodeModules = path.resolve(__dirname, '../../node_modules');

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router-dom'],
    alias: [
      { find: 'react', replacement: path.resolve(rootNodeModules, 'react') },
      { find: 'react-dom', replacement: path.resolve(rootNodeModules, 'react-dom') },
    ],
  },
  define: {
    'process.env.BACKEND_URL': JSON.stringify(process.env.BACKEND_URL || ''),
    'process.env.SERVER_URL': JSON.stringify(process.env.SERVER_URL || ''),
  },
});
