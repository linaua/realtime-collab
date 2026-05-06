import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': resolve(__dirname, './src') },
  },
  server: {
    proxy: {
      '/auth':     'http://localhost:4000',
      '/rooms':    'http://localhost:4000',
      '/messages': 'http://localhost:4000',
    },
  },
})