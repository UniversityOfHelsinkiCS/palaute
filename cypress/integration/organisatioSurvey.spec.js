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

  it('User with organisation access can create new organisation surveys', () => {
    cy.visit(`${baseUrl}/organisations/500-K005/organisation-surveys`)

    cy.get('[data-cy="organisation-surveys-add-new"]').should('be.visible').click()

    cy.get('[data-cy="organisation-surveys-add-new"]').should('be.disabled')
    cy.get('[data-cy="organisation-surveys-editor-title"]').should('be.visible')

    cy.get('[data-cy="formik-locales-field-fi-name"]').should('be.visible').type('Testi kysely')
    cy.get('[data-cy="formik-locales-field-sv-name"]').should('be.visible').type('Testundersökning')
    cy.get('[data-cy="formik-locales-field-en-name"]').should('be.visible').type('Test survey')

    cy.get('[data-cy="formik-date-picker-field-startDate"]').should('be.visible')

    cy.get('[data-cy="formik-date-picker-field-endDate"]').should('be.visible')

    cy.get('[data-cy="formik-responsible-teacher-input-field"]').should('be.visible')

    cy.get('[data-cy="formik-date-picker-field-endDate"]').should('be.visible')
  })
})
