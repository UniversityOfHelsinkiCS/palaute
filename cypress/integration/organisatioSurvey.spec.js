/* eslint-disable cypress/no-unnecessary-waiting */
const { baseUrl } = require('../support')

describe('Organisation Surveys: User with organisation access', () => {
  beforeEach(() => {
    cy.clearOrganisationSurveys()

    cy.clearTestStudents()
    cy.seedTestStudents()

    cy.clearComputerScienceCorrespondents()
    cy.seedComputerScienceCorrespondents()

    cy.loginAsOrganisationCorrespondent()
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

    // Fill in the name of the survey
    cy.get('[data-cy="formik-locales-field-fi-name"]').type('Testi kysely')
    cy.get('[data-cy="formik-locales-field-sv-name"]').type('Testundersökning')
    cy.get('[data-cy="formik-locales-field-en-name"]').type('Test survey')

    // Assert that the startDate picker is there
    cy.get('[data-cy="formik-date-picker-field-startDate"]').should('be.visible')

    // Assert that the endDate picker is there
    cy.get('[data-cy="formik-date-picker-field-endDate"]').should('be.visible')

    // Assert responsible teacher input field is there
    cy.get('[data-cy="formik-responsible-teacher-input-field"]').should('be.visible')

    // Assert student number input field is there
    cy.get('[data-cy="formik-student-number-input-field"]').should('be.visible')

    // Assert that the logged user is by default the responsible teacher
    cy.get('[data-cy="formik-responsible-teacher-input-field-chip"]').as('teacherChipTag')
    cy.get('@teacherChipTag').should('exist')
    cy.get('@teacherChipTag').should('have.attr', 'data-tag-index', '0')
    cy.get('@teacherChipTag').should('have.text', 'Correspondent Tester')

    // Add a new responsible teacher by inserting the email or name
    cy.get('[data-cy="formik-responsible-teacher-input-field"]').type('Tommi Testaaja')
    cy.get('.MuiAutocomplete-popper [role="listbox"] [role="option"]').contains('Tommi Testaaja').click()

    // Assert that the added responsible teacher chip is rendered correctly
    cy.get('[data-cy="formik-responsible-teacher-input-field-chip"]').as('teacherChips')
    cy.get('@teacherChips').contains('[data-tag-index=0]', 'Correspondent Tester')
    cy.get('@teacherChips').contains('[data-tag-index=1]', 'Tommi Testaaja')

    // Add a new student by inserting the student number
    // Assert that the added student number is rendered to a chip correctly
    cy.get('[data-cy="formik-student-number-input-field"]').as('studentInput')
    cy.get('@studentInput').type('014895968{enter}')
    cy.get('@studentInput').type('015303763 ')
    cy.get('@studentInput').type('015144922;')
    cy.get('@studentInput').type('211111112,')

    cy.get('[data-cy="formik-student-number-input-field-chip-014895968"]').should('exist')
    cy.get('[data-cy="formik-student-number-input-field-chip-015303763"]').should('exist')
    cy.get('[data-cy="formik-student-number-input-field-chip-015144922"]').should('exist')
    cy.get('[data-cy="formik-student-number-input-field-chip-211111112"]').should('exist')

    cy.get('[data-cy="organisation-survey-editor-save"]').click()

    // Assert that the survey was created
    cy.visit(`${baseUrl}/organisations/500-K005/organisation-surveys`)

    cy.get('[data-cy="organisation-survey-item-title-Test survey"]').should('exist')
    cy.get('[data-cy="organisation-survey-not-open-Test survey"]').should('exist')
    cy.get('[data-cy="organisation-survey-period-info-Test survey"]').should('exist')
    cy.get('[data-cy="organisation-survey-feedback-count-Test survey"]').should('exist')
    cy.get('[data-cy="organisation-survey-feedback-count-percentage-0/4"]').should('exist')
    cy.get('[data-cy="organisation-survey-responsible-persons-Test survey"]').should('exist')
    cy.get('[data-cy="organisation-survey-responsible-persons-Test survey-chips-Correspondent Tester"]').should('exist')
    cy.get('[data-cy="organisation-survey-responsible-persons-Test survey-chips-Tommi Testaaja"]').should('exist')

    cy.get('[data-cy="organisation-survey-show-feedback-Test survey"]').should('exist')
    cy.get('[data-cy="organisation-survey-edit-Test survey"]').should('exist')
    cy.get('[data-cy="organisation-survey-delete-Test survey"]').should('exist')
  })

  it('can not create survey without name', () => {
    cy.visit(`${baseUrl}/organisations/500-K005/organisation-surveys`)

    // try to save a new survey without inserting any information
    cy.get('[data-cy="organisation-surveys-add-new"]').click()
    cy.get('[data-cy="organisation-survey-editor-save"]').click()

    cy.get('[data-cy="formik-locales-field-fi-name"]').contains('p', 'This field is required')
    cy.get('[data-cy="formik-locales-field-sv-name"]').contains('p', 'This field is required')
    cy.get('[data-cy="formik-locales-field-en-name"]').contains('p', 'This field is required')
  })

  it('can not set the end date to be before the start date', () => {
    cy.visit(`${baseUrl}/organisations/500-K005/organisation-surveys`)

    // try to set the end date to be before the start date
    cy.get('[data-cy="organisation-surveys-add-new"]').click()
    cy.get('[data-cy="formik-locales-field-en-name"]').type('Test survey')

    cy.get('[data-cy="formik-date-picker-field-startDate"]').clear().type('01/01/2100{enter}')

    cy.get('[data-cy="organisation-survey-editor-save"]').click()

    cy.get('[data-cy="formik-date-picker-field-endDate"]').parent().as('endDateInputParent')
    cy.get('@endDateInputParent').contains('p', 'Survey closing date is before opening date')
  })

  it('can not add a responsible teacher as a student at the same time', () => {
    cy.visit(`${baseUrl}/organisations/500-K005/organisation-surveys`)

    // try to insert the logged user's student number to the stundent number field and assert that the saving fails
    cy.get('[data-cy="organisation-surveys-add-new"]').click()
    cy.get('[data-cy="formik-locales-field-en-name"]').type('Test survey')

    cy.get('[data-cy="formik-student-number-input-field"]').as('studentInput')
    cy.get('@studentInput').type('000000000{enter}')
    cy.get('[data-cy="formik-student-number-input-field-chip-000000000"]').should('exist')

    cy.get('[data-cy="organisation-survey-editor-save"]').click()

    cy.get('@studentInput').contains('p', 'Responsible person can not be a student at the same time')
  })

  it.skip('can edit organisation surveys before any feedback is given', () => {})

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
