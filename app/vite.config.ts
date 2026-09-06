import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Served from https://<user>.github.io/shiomi/ in production (a GitHub Pages
  // project site), but from the dev server root locally.
  base: command === 'build' ? '/shiomi/' : '/',
}))
