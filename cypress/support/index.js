// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

const inE2EMode = process.env.REACT_APP_E2E === 'true'

beforeEach(() => {
  cy.enableCourses()
  cy.enableTestUsers()
  cy.setUpAdminTeacherView()
  cy.setUpSecondaryTeacherView()
})

export const baseUrl = inE2EMode ? 'localhost:8000' : 'localhost:8000'
// Alternatively you can use CommonJS syntax:
// require('./commands')
