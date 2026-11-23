import { sentryVitePlugin } from '@sentry/vite-plugin'
import react from '@vitejs/plugin-react-swc'
import * as config from 'config'
import path from 'path'
import { defineConfig } from 'vite'

import { CLIENT_CONFIG_KEYS } from './src/common/clientConfig'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      applicationKey: 'norppa-course-feedback',
      telemetry: false,
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
  envPrefix: ['VITE_', 'REACT_APP_'],
  define: {
    'import.meta.env.BASE_PATH': JSON.stringify(process.env.BASE_PATH ?? ''),
    CONFIG: Object.fromEntries(CLIENT_CONFIG_KEYS.filter(key => config.has(key)).map(key => [key, config.get(key)])),
  },
})
