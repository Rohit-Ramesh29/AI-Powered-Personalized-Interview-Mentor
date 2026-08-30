import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages hosts this project under /AI-Powered-Personalized-Interview-Mentor/.
  base: process.env.GITHUB_ACTIONS ? '/AI-Powered-Personalized-Interview-Mentor/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
