import { baseUrl } from '../support'

describe('Course realisation summaries', () => {
  it('User gets 403 when trying to navigate to CUR summary with no data', () => {
    cy.loginAsStudyCoordinator()
    cy.visit(`${baseUrl}/course-summary/TKT21029`)
    cy.contains('403 Forbidden')
  })
})
