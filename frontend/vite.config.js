import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer'],
      globals: { Buffer: true, global: true }
    })
  ],
  define: {
    // By default, Vite doesn't include shims for NodeJS/
    // necessary for stellar-sdk and stellar-wallets-kit to work
    global: 'globalThis',
  },
})
