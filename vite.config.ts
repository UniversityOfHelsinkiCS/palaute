import react from '@vitejs/plugin-react-swc'
import eslint from 'vite-plugin-eslint'

import config from 'config'
import { defineConfig } from 'vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    eslint(),
    sentryVitePlugin({
      applicationKey: 'norppa-course-feedback',
    }),
  ],
  server: {
    proxy: {
      '/api/': {
        target: 'http://127.0.0.1:8000',
      },
      '/test/': {
        target: 'http://127.0.0.1:8000',
      },
    },
    host: true,
    port: 3000,
  },
  build: {
    outDir: 'build/client',
    sourcemap: true,
  },
  define: {
    'process.env': process.env,
    CONFIG: (() => {
      const configObj = config.util.toObject()
      for (const key of config.get<string[]>('PRIVATE_KEYS')) {
        delete configObj[key]
      }
      return configObj
    })(),
  },
})
