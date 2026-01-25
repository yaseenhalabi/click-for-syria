import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.config'

export default defineConfig(({ command }) => ({
  plugins: [react(), crx({ manifest })],
  ...(command === 'serve'
    ? { server: { host: true, port: 5173, strictPort: true, cors: true, headers: { 'Access-Control-Allow-Origin': '*' } } }
    : {}),
}))