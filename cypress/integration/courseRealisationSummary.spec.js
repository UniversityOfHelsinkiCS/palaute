import { baseUrl } from '../support'

describe('Course realisation summaries', () => {
  it('User gets a message telling no course realisations when cur summary has no data', () => {
    cy.loginAsStudyCoordinator()
    cy.visit(`${baseUrl}/course-summary/TKT21029`)
    cy.get('[data-cy=noCourseRealisations]').should('exist')
  })
})
