// eslint-disable-next-line
const { defineConfig } = require('cypress')
const { checkFolder } = require('./cypress/scripts/checkFolder')
const { readXLSX } = require('./cypress/scripts/readXLSX')

module.exports = defineConfig({
  viewportWidth: 1800,
  viewportHeight: 1200,
  defaultCommandTimeout: 10000,
  video: true,
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/index.js',
    specPattern: 'cypress/**/*.spec.js',
    experimentalRunAllSpecs: true,

    setupNodeEvents(on, config) {
      on('task', {
        checkFolder,
        readXLSX,
      })
    },
  },
})
