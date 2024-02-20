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

import { addDays } from 'date-fns'
import { baseUrl } from './baseUrl'
import { admin, testUsers, teacher, student } from '../fixtures/headers'

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

  cy.request({
    method: 'POST',
    url: 'test/seed-feedback-targets',
    body: { teacher, student, opensAt: addDays(new Date(), 1), closesAt: addDays(new Date(), 2) },
    headers: admin,
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

export { baseUrl }

// Alternatively you can use CommonJS syntax:
// require('./commands')
