import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { 
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true, // so backend thinks req comming from localhost:5000 
      },
    },
  },
})
