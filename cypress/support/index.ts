/* eslint-disable no-unused-vars */
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

import { testUsers } from '../fixtures/headers'

beforeEach(() => {
  cy.request({
    method: 'POST',
    url: 'test/reset-db',
  })

  cy.request({
    method: 'POST',
    url: 'test/seed-users',
    body: testUsers,
  })

  // cy.enableTestUsers()
  // cy.setUpAdminTeacherView()
  // cy.setUpSecondaryTeacherView()
})

Cypress.on('uncaught:exception', err => {
  if (err.message.includes('THIS_IS_A_TEST_ERROR_CAUSED_BY_ADMIN_PLEASE_IGNORE')) {
    return false
  }
  return true
})

// Alternatively you can use CommonJS syntax:
// require('./commands')

// cypress/support/index.ts
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      loginAs(headers: any): Chainable
      createFeedbackTarget(options: { extraStudents?: number }): Chainable
      setFeedbackActive(): Chainable
      setFeedbackInactive(): Chainable
      getTestFbtId(): Chainable
      getUniversityQuestions(): Chainable
    }
  }
}
