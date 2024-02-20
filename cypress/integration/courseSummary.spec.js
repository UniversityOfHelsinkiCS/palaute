/// <reference types="Cypress" />

const { admin, summaryUser } = require('../fixtures/headers')
const { baseUrl } = require('../support')

/**
 * For test data, see src/server/services/testServices/initSummary.js
 */
describe('Course summary', () => {
  before(() => {
    cy.request({
      method: 'POST',
      url: '/api/test/init-summary',
      body: summaryUser,
      headers: admin,
    })
  })

  beforeEach(() => {
    cy.loginAs(summaryUser)
    cy.visit(`${baseUrl}/course-summary?startDate=2023-08-01&endDate=2024-07-31&option=year`)
  })

  after(() => {
    cy.request({
      method: 'POST',
      url: '/api/test/clear-summary',
      body: summaryUser,
      headers: admin,
    })
  })

  it('Should have data in My Organisations', () => {
    cy.get('[data-cy=my-organisations]').click()

    cy.contains('TEST_SUMMARY_ORG')
    cy.contains('SUMMARY_TEST_COURSE')
    cy.contains('5.00')
    cy.contains('2 / 2')
    cy.contains('100%')
  })

  it('Should have data in My Courses', () => {
    cy.get('[data-cy=my-courses]').click()

    cy.contains('TEST_SUMMARY_ORG')
    cy.contains('SUMMARY_TEST_COURSE')
    cy.contains('5.00')
    cy.contains('2 / 2')
    cy.contains('100%')
  })
})
