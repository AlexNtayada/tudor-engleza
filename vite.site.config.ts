import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// The tudoo.ro homepage (site/). Built after the app, into the root of dist/, next to dist/app/.
export default defineConfig({
  root: 'site',
  base: './',
  plugins: [react()],
  server: { port: 5174 },
  build: {
    outDir: '../dist',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'site/index.html'),
        confidentialitate: resolve(__dirname, 'site/confidentialitate.html'),
        404: resolve(__dirname, 'site/404.html'),
      },
    },
  },
})
