/* eslint-disable */
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8000',
    supportFile: 'cypress/support/commands.js',
    specPattern: 'cypress/**/*.spec.js',
  },
})
