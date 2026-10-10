import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    tailwindcss(),
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Personality and interest discovery',
        short_name: 'Discovery',
        description: 'A private questionnaire for personality traits and work interests.',
        theme_color: '#1d4e89',
        background_color: '#f4f1ea',
        display: 'standalone',
        start_url: './',
        icons: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,ico,webmanifest}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
  build: {
    sourcemap: false,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
  },
})
