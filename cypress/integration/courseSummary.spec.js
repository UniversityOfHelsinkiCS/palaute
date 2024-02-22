const { baseUrl } = require('../support')

describe('Course summary', () => {
  before(() => {
    cy.loginAsStudyCoordinator()
    cy.visit(`${baseUrl}/course-summary`)
    cy.get('[data-cy=update-data]').click()
  })

  beforeEach(() => {
    cy.loginAsStudyCoordinator()
    cy.visit(`${baseUrl}/course-summary`)
  })

  it('should show my courses', () => {
    cy.get('[data-cy=my-courses]').should('exist')
  })
})
