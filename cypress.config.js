/* eslint-disable */
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  viewportWidth: 1800,
  viewportHeight: 1200,
  e2e: {
    baseUrl: 'http://localhost:8000',
    supportFile: 'cypress/support/commands.js',
    specPattern: 'cypress/**/*.spec.js',
  },
})
