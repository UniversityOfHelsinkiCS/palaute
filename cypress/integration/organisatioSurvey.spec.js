const { baseUrl } = require('../support')

describe('Organisation Survey view', () => {
  beforeEach(() => {
    cy.loginAsStudyCoordinator()
  })

  it('User with organisation access can visit organisation survey page', () => {
    cy.visit(`${baseUrl}/organisations/500-K005/settings`)

    cy.contains('Programme surveys').click()

    cy.get('[data-cy="organisation-surveys-add-new"]').should('be.visible')

    cy.get('[data-cy="organisation-surveys-no-surveys-alert"]').should('be.visible')
  })
})
