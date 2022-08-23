import { baseUrl } from '../support'

describe('Course realisation summaries', () => {
  it('User can navigate to course realisation summaries', () => {
    cy.loginAsStudyCoordinator()
    cy.visit(`${baseUrl}/course-summary/TKT21029`)
    cy.contains('Course realisation')
  })
})
