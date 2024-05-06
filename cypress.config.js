/* eslint-disable */
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  defaultCommandTimeout: 60000,
  viewportWidth: 1800,
  viewportHeight: 1200,
  e2e: {
    baseUrl: 'http://localhost:8000',
    supportFile: 'cypress/support/index.js',
    specPattern: 'cypress/**/*.spec.js',
    experimentalRunAllSpecs: true,
  },
})
