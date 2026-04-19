import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Tomi-Gabi Gastos',
        short_name: 'TomiGabi',
        description: 'Control Financiero Inteligente Tomi & Gabi',
        theme_color: '#2c4bda',
        icons: [
          {
            src: 'clipboard_543117.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'clipboard_543117.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  base: './',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
