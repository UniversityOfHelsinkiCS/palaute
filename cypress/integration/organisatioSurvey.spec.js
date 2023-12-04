const { baseUrl } = require('../support')

describe('Organisation Surveys: User with organisation access', () => {
  beforeEach(() => {
    cy.loginAsStudyCoordinator()
  })

  it('can visit organisation survey page', () => {
    cy.visit(`${baseUrl}/organisations/500-K005/settings`)

    cy.contains('Programme surveys').click()

    cy.get('[data-cy="organisation-surveys-add-new"]').should('be.visible')

    cy.get('[data-cy="organisation-surveys-no-surveys-alert"]').should('be.visible')
  })

  it('can access new survey window and the form is rendered correctly', () => {
    cy.visit(`${baseUrl}/organisations/500-K005/organisation-surveys`)

    cy.get('[data-cy="organisation-surveys-add-new"]').should('be.visible').click()

    cy.get('[data-cy="organisation-surveys-add-new"]').should('be.disabled')
    cy.get('[data-cy="organisation-surveys-editor-title"]').should('be.visible')

    cy.get('[data-cy="formik-locales-field-fi-name"]').should('be.visible')
    cy.get('[data-cy="formik-locales-field-sv-name"]').should('be.visible')
    cy.get('[data-cy="formik-locales-field-en-name"]').should('be.visible')

    cy.get('[data-cy="formik-date-picker-field-startDate"]').should('be.visible')

    cy.get('[data-cy="formik-date-picker-field-endDate"]').should('be.visible')

    cy.get('[data-cy="formik-responsible-teacher-input-field"]').should('be.visible')

    cy.get('[data-cy="formik-student-number-input-alert"]').should('be.visible')
    cy.get('[data-cy="formik-student-number-input-expand-icon"]').should('be.visible')
    cy.get('[data-cy="formik-student-number-input-delimeter-list"]').should('not.exist')
    cy.get('[data-cy="formik-student-number-input-example"]').should('not.exist')
    cy.get('[data-cy="formik-student-number-input-field"]').should('be.visible')

    cy.get('[data-cy="formik-student-number-input-expand-icon"]').click()
    cy.get('[data-cy="formik-student-number-input-delimeter-list"]').should('exist')
    cy.get('[data-cy="formik-student-number-input-delimeter-list"]').should('be.visible')

    cy.get('[data-cy="formik-student-number-input-example"]').should('exist')
    cy.get('[data-cy="formik-student-number-input-example"]').should('be.visible')

    cy.get('[data-cy=organisation-survey-editor-save]').should('be.visible')
    cy.get('[data-cy=organisation-survey-editor-cancel]').should('be.visible')

    cy.get('[data-cy=organisation-survey-editor-save]').should('be.not.disabled')
  })

  it('can fill in new organisation surveys', () => {
    cy.visit(`${baseUrl}/organisations/500-K005/organisation-surveys`)

    cy.get('[data-cy="organisation-surveys-add-new"]').click()

    cy.get('[data-cy="formik-locales-field-fi-name"]').type('Testi kysely')
    cy.get('[data-cy="formik-locales-field-sv-name"]').type('Testundersökning')
    cy.get('[data-cy="formik-locales-field-en-name"]').type('Test survey')

    cy.get('[data-cy="formik-date-picker-field-startDate"]').should('be.visible')

    cy.get('[data-cy="formik-date-picker-field-endDate"]').should('be.visible')

    cy.get('[data-cy="formik-responsible-teacher-input-field"]').should('be.visible')
    // assure that the logged user is by default the responsible teacher
    // add a new responsible teacher by inserting the email or name
    // assure that the added responsible teacher chip is rendered correctly

    cy.get('[data-cy="formik-student-number-input-field"]').should('be.visible')
    // add a new student by inserting the student number
    // assure that the added student number is rendered to a chip correctly
  })

  it.skip('can not create survey without name', () => {
    // try to save a new survey without inserting any information
  })

  it.skip('can not set the end date to be before the start date', () => {
    // try to set the end date to be before the start date
  })

  it.skip('can not add a responsible teacher as a student at the same time', () => {
    // fill  in the name field of a single language
    // try to insert the logged user's student number to the stundent number field and assert that the saving fails
  })

  it.skip('can view created organisation surveys', () => {})

  it.skip('can edit created organisation surveys', () => {})

  it.skip('can edit delete organisation surveys before any feedback is given', () => {})

  it.skip('can not delete organisation surveys after feedback has been given', () => {})
})

describe('Organisation Surveys: Students', () => {
  beforeEach(() => {
    cy.loginAsStudent()
  })
})

describe('Organisation Surveys: Teachers', () => {
  beforeEach(() => {
    cy.loginAsTeacher()
  })
})

describe('Organisation Surveys: Admin users', () => {
  beforeEach(() => {
    cy.loginAsAdmin()
  })

  it.skip('can delete organisation surveys after feedback has been given', () => {})
})
