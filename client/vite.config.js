import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
   root: '.', 
  build: {
    outDir: 'dist'
  },
  server: {
    port: 5173,
    host: true
  }
})
