// eslint-disable-next-line
const { defineConfig } = require('cypress')
const createBundler = require('@bahmutov/cypress-esbuild-preprocessor')
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

    setupNodeEvents(on) {
      // TODO: remove this custom preprocessor once Cypress >= 15.19.0 is published to npm.
      // The built-in ts-loader preprocessor crashes on typescript@7 (no JS compiler API left);
      // Cypress ships a native fix for this in 15.19.0 (see cypress-io/cypress#34258 / #34277).
      on('file:preprocessor', createBundler())
      on('task', {
        checkFolder,
        readXLSX,
        log(message) {
          // eslint-disable-next-line no-console
          console.log(message)
          return null
        },
      })
    },
  },
})
