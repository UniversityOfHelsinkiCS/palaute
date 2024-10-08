/// <reference types="Cypress" />

const { summaryUser } = require('../fixtures/headers')

/**
 * For test data, see src/server/services/testServices/initSummary.js
 */
describe('Course summary', () => {
  beforeEach(() => {
    cy.request({
      method: 'POST',
      url: '/test/init-summary',
      body: summaryUser,
    })
    cy.loginAs(summaryUser)
    cy.visit(`/course-summary`)
  })

  it('Should have data in My Organisations and my courses', () => {
    cy.get('[data-cy=my-organisations]').click()

    cy.contains('TEST_SUMMARY_ORG', { timeout: 12000 })
    cy.contains('SUMMARY_TEST_COURSE')
    cy.contains('5.00')
    cy.contains('2 / 2')
    cy.contains('100%')

    cy.get('[data-cy=my-courses]').click()

    cy.contains('TEST_SUMMARY_ORG')
    cy.contains('SUMMARY_TEST_COURSE')
    cy.contains('5.00')
    cy.contains('2 / 2')
    cy.contains('100%')
  })
})
