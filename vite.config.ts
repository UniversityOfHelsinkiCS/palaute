import { sentryVitePlugin } from '@sentry/vite-plugin'
import react from '@vitejs/plugin-react-swc'
import * as config from 'config'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
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
  resolve: {
    alias: {
      '@common': path.resolve(__dirname, 'src/common'),
    },
  },
  build: {
    outDir: 'build/client',
    sourcemap: true,
  },
  define: {
    'process.env': process.env,
    CONFIG: (() => {
      const configObj = config.util.toObject(undefined)
      for (const key of config.get<string[]>('PRIVATE_KEYS')) {
        delete configObj[key]
      }

      return configObj
    })(),
  },
})
