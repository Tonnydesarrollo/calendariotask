import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')

  return {
    server: {
      port: 5173,
      host: '0.0.0.0',
      allowedHosts: ['lavenia-clinical-bizarrely.ngrok-free.dev']
    },

    preview: {
      port: 3000,
      host: '0.0.0.0'
    },

    plugins: [
      react(),
    VitePWA({
    registerType: 'autoUpdate',
    injectRegister: 'auto',
    filename: 'manifest.webmanifest',
    includeAssets: ['favicon.ico', 'favicon.png', 'icons/icon-192.png', 'icons/icon-512.png'],
    workbox: {
      runtimeCaching: [
        {
          urlPattern: /^\/icons\//,
          handler: 'CacheFirst',
          options: {
            cacheName: 'icons-cache',
            expiration: {
              maxEntries: 60,
              maxAgeSeconds: 60 * 60 * 24 * 365
            }
          }
        },
        {
          urlPattern: /^\/manifest\.webmanifest$/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'manifest-cache'
          }
        }
      ]
    },
  manifest: {
  "name": "TaskSync - Control de Tareas",
  "short_name": "TaskSync",
 "start_url": "/?source=pwa",

  "scope": "/",
  "display": "standalone",
"display_override": ["window-controls-overlay", "standalone"],

  "background_color": "#f8fafc",
  "theme_color": "#0f172a",
  "lang": "es",
 "icons": [
  {
    "src": "/icons/icon-192.png",
    "sizes": "192x192",
    "type": "image/png",
    "purpose": "any"
  },
  {
    "src": "/icons/icon-192.png",
    "sizes": "192x192",
    "type": "image/png",
    "purpose": "maskable"
  },
  {
    "src": "/icons/icon-512.png",
    "sizes": "512x512",
    "type": "image/png",
    "purpose": "any"
  },
  {
    "src": "/icons/icon-512.png",
    "sizes": "512x512",
    "type": "image/png",
    "purpose": "maskable"
  }
]

}

})

    ],

    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.Project_URL': JSON.stringify(env.Project_URL || env.VITE_SUPABASE_URL),
      'process.env.Publishable_Key': JSON.stringify(env.Publishable_Key || env.VITE_SUPABASE_ANON_KEY),
      'process.env.Anon_Key': JSON.stringify(env.Anon_Key || env.VITE_SUPABASE_ANON_KEY)
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.')
      }
    }
  }
})
