import { student } from '../fixtures/headers'

describe('Search page', () => {
  beforeEach(() => {
    cy.loginAs(student)
    cy.visit('/search')
  })

  it('should have a working search bar with organisations but tkt has no courses in test data', () => {
    cy.get('[data-cy=search-input]').click()
    cy.contains('H50') // <-- Matlu
    cy.contains('500-K005').as('tkt') // <-- Käpistely kandi

    cy.get('@tkt').click()

    cy.get('[data-cy=no-courses-alert]')
  })
})
