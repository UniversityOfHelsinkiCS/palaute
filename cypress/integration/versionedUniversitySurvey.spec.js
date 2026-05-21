/// <reference types="cypress" />

const { summaryUser } = require('../fixtures/headers')

describe('Versioned university survey questions in summary view', () => {
  beforeEach(() => {
    cy.request({
      method: 'POST',
      url: '/test/init-versioned-summary',
      body: summaryUser,
      timeout: 120000,
    })
    cy.loginAs(summaryUser)
  })

  it('my-organisations view: shows old questions for 2024-2025 and new questions for 2025-2026', () => {
    cy.visit('/course-summary/my-organisations')

    cy.contains('Versioitu testiorg', { timeout: 12000 })

    // Select 2024-2025 (before the synthetic 2025-08-01 cutover)
    cy.get('#year-selector').click()
    cy.get('[data-cy="year-selector-item-2024–2025"]').click()

    cy.contains('Testikysymys 1', { timeout: 10000 })
    cy.contains('Uusi testikysymys 1').should('not.exist')

    // Select 2025-2026 (after the synthetic 2025-08-01 cutover)
    cy.get('#year-selector').click()
    cy.get('[data-cy="year-selector-item-2025–2026"]').click()

    cy.contains('Uusi testikysymys 1', { timeout: 10000 })
    cy.contains('Testikysymys 1').should('not.exist')
  })

  it('Shows old questions for 2024-2025 and new questions for 2025-2026', () => {
    cy.visit('/organisations/VERSIONED_TEST_ORG/summary')

    // Select 2024-2025 (before the synthetic 2025-08-01 cutover)
    cy.get('#year-selector').click()
    cy.get('[data-cy="year-selector-item-2024–2025"]').click()

    cy.contains('Testikysymys 1', { timeout: 10000 })
    cy.contains('Uusi testikysymys 1').should('not.exist')

    // Select 2025-2026 (after the synthetic 2025-08-01 cutover)
    cy.get('#year-selector').click()
    cy.get('[data-cy="year-selector-item-2025–2026"]').click()

    cy.contains('Uusi testikysymys 1', { timeout: 10000 })
    cy.contains('Testikysymys 1').should('not.exist')
  })
})
