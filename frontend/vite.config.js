import { defineConfig } from 'vite'

export default defineConfig({
  envPrefix: 'VITE_',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    port: 3000,
    open: true
  }
}) 