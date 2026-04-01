import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import basicSsl from '@vitejs/plugin-basic-ssl'

const useSSL = process.env.VITE_SSL === 'true';

export default defineConfig({
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5176,
    strictPort: false,
    host: true,
    historyApiFallback: true,
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
  plugins: [
    ...(useSSL ? [basicSsl()] : []),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'IdeaPA',
        short_name: 'IdeaPA',
        description: 'Voice-first idea capture',
        theme_color: '#E24B4A',
        background_color: '#0f0f0f',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
