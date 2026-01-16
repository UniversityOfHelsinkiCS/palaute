// eslint-disable-next-line
const { defineConfig } = require('cypress')
const { checkFolder } = require('./cypress/scripts/checkFolder')
const { readXLSX } = require('./cypress/scripts/readXLSX')

module.exports = defineConfig({
  viewportWidth: 1800,
  viewportHeight: 1200,
  defaultCommandTimeout: 10000,
  pageLoadTimeout: 60000,
  video: true,
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/index.ts',
    specPattern: 'cypress/**/*.spec.{js,ts}',
    experimentalRunAllSpecs: true,

    setupNodeEvents(on, config) {
      on('task', {
        checkFolder,
        readXLSX,
      })
    },
  },
})
