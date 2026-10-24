import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // during development, forward /api calls to the express server
    proxy: { '/api': 'http://localhost:4000' },
  },
})
