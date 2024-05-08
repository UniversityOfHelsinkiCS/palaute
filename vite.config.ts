import react from '@vitejs/plugin-react-swc'
import eslint from 'vite-plugin-eslint'

import * as config from 'config'
import { defineConfig } from 'vite'

const inStaging = process.env.REACT_APP_STAGING === 'true'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), eslint()],
  server: {
    proxy: {
      '/api/': {
        target: 'http://localhost:8000',
      },
    },
    host: true,
    port: 3000,
  },
  build: {
    outDir: 'build/client',
    sourcemap: 'hidden',
  },
  define: {
    'process.env': process.env,
    CONFIG: (() => {
      const configObj = config.util.toObject(undefined)
      for (const key of config.get('PRIVATE_KEYS')) {
        delete configObj[key]
      }

      return configObj
    })(),
  },
})
