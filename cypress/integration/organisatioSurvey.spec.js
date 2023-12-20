import { studentRandom } from '../fixtures/headers'

const { baseUrl } = require('../support')

describe('Feedback Correspondents', () => {
  beforeEach(() => {
    cy.clearTestStudents()
    cy.clearOrganisationSurveys()
    cy.clearComputerScienceCorrespondents()

    cy.seedTestStudents()
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
    cy.get('[data-cy="organisation-survey-show-results-Test survey"]').should('not.exist')
    cy.get('[data-cy="organisation-survey-delete-Test survey"]').should('exist')
  })

  it('can not create survey with validation errors', () => {
    cy.visit(`${baseUrl}/organisations/500-K005/organisation-surveys`)

    // try to save a new survey without inserting any information
    cy.get('[data-cy="organisation-surveys-add-new"]').click()
    cy.get('[data-cy="organisation-survey-editor-save"]').click()

    cy.get('[data-cy="formik-locales-field-fi-name"]').contains('p', 'This field is required')
    cy.get('[data-cy="formik-locales-field-sv-name"]').contains('p', 'This field is required')
    cy.get('[data-cy="formik-locales-field-en-name"]').contains('p', 'This field is required')

    // try to insert the logged user's student number to the stundent number field and assert that the saving fails
    cy.get('[data-cy="formik-locales-field-en-name"]').type('Test survey')

    cy.get('[data-cy="formik-student-number-input-field"]').as('studentInput')
    cy.get('@studentInput').type('000000000{enter}')
    cy.get('[data-cy="formik-student-number-input-field-chip-000000000"]').should('exist')

    cy.get('[data-cy="organisation-survey-editor-save"]').click()

    cy.get('@studentInput').contains('p', 'Responsible person can not be a student at the same time')

    // try to add student as the responsible teacher
    cy.get('[data-cy="formik-responsible-teacher-input-field"]').type('henri.testaaja@helsinki.fi')
    cy.get('.MuiAutocomplete-popper [role="listbox"] [role="option"]').should('not.exist')

    // try to add invalid student
    cy.get('[data-cy="formik-student-number-input-field-chip-000000000"]')
      .find('[data-testid="CancelIcon"]')
      .should('be.visible')
      .click()

    cy.get('@studentInput').clear().type('0148959{enter}')
    cy.get('[data-cy="formik-student-number-input-field-chip-0148959"]').should('exist')

    cy.get('[data-cy="organisation-survey-editor-save"]').click()

    cy.get('@studentInput').contains('p', 'Please check the indicated invalid student numbers')
  })

  it.skip('can not set the end date to be before the start date', () => {
    cy.visit(`${baseUrl}/organisations/500-K005/organisation-surveys`)

    // try to set the end date to be before the start date
    cy.get('[data-cy="organisation-surveys-add-new"]').click()
    cy.get('[data-cy="formik-locales-field-en-name"]').type('Test survey')

    // FIX:
    // This shit is not working in the CI as the Material UI DatePicker component
    // is rendered as mobile version and it is readonly, even the force type doees not work
    cy.get('[data-cy="formik-date-picker-field-startDate-input"]')
      .clear('input', { force: true })
      .type('01/01/2100{enter}', { force: true })

    cy.get('[data-cy="organisation-survey-editor-save"]').click()

    cy.get('[data-cy="formik-date-picker-field-endDate"]').parent().as('endDateInputParent')
    cy.get('@endDateInputParent').contains('p', 'Survey closing date is before opening date')
  })

  it('can edit organisation surveys', () => {
    cy.visit(`${baseUrl}/organisations/500-K005/organisation-surveys`)

    // Create a new survey with just the name given
    cy.get('[data-cy="organisation-surveys-add-new"]').click()
    cy.get('[data-cy="formik-locales-field-en-name"]').type('Test survey')

    cy.get('[data-cy="organisation-survey-editor-save"]').click()
    cy.visit(`${baseUrl}/organisations/500-K005/organisation-surveys`)

    // Assure that the survey does not have any students and only one responsible teacher
    cy.get('[data-cy="organisation-survey-item-title-Test survey"]').should('exist')
    cy.get('[data-cy="organisation-survey-feedback-count-percentage-0/0"]').should('exist')
    cy.get('[data-cy="organisation-survey-responsible-persons-Test survey"]').should('exist')
    cy.get('[data-cy="organisation-survey-responsible-persons-Test survey-chips-Correspondent Tester"]').should('exist')
    cy.get('[data-cy="organisation-survey-responsible-persons-Test survey-chips-Tommi Testaaja"]').should('not.exist')

    // Edit the survey to add students and new responsible teacher
    cy.get('[data-cy="organisation-survey-show-feedback-Test survey"').should('exist').click()
    cy.get('[data-cy="feedback-target-edit-organisation-survey"]').should('exist').click()

    // Add new teacher
    cy.get('[data-cy="formik-responsible-teacher-input-field"]').type('Tommi Testaaja')
    cy.get('.MuiAutocomplete-popper [role="listbox"] [role="option"]').contains('Tommi Testaaja').click()

    // Add students
    cy.get('[data-cy="formik-student-number-input-field"]').as('studentInput')
    cy.get('@studentInput').type('014895968{enter}')
    cy.get('[data-cy="formik-student-number-input-field-chip-014895968"]').should('exist')
    cy.get('@studentInput').type('211111112{enter}')
    cy.get('[data-cy="formik-student-number-input-field-chip-211111112"]').should('exist')

    cy.get('[data-cy="organisation-survey-editor-save"]').click()

    // Assure the changes is visible
    cy.visit(`${baseUrl}/organisations/500-K005/organisation-surveys`)

    cy.get('[data-cy="organisation-survey-item-title-Test survey"]').should('exist')
    cy.get('[data-cy="organisation-survey-feedback-count-percentage-0/2"]').should('exist')
    cy.get('[data-cy="organisation-survey-responsible-persons-Test survey"]').should('exist')
    cy.get('[data-cy="organisation-survey-responsible-persons-Test survey-chips-Correspondent Tester"]').should('exist')
    cy.get('[data-cy="organisation-survey-responsible-persons-Test survey-chips-Tommi Testaaja"]').should('exist')

    // Edit the survey name
    cy.get('[data-cy="organisation-survey-show-feedback-Test survey"').should('exist').click()
    cy.get('[data-cy="feedback-target-edit-organisation-survey"]').should('exist').click()

    cy.get('[data-cy="formik-locales-field-en-name"]').clear().type('Greatest survey of them all!')

    cy.get('[data-cy="organisation-survey-editor-save"]').click()

    // Assure that only the name changed
    cy.visit(`${baseUrl}/organisations/500-K005/organisation-surveys`)

    cy.get('[data-cy="organisation-survey-item-title-Test survey"]').should('not.exist')
    cy.get('[data-cy="organisation-survey-item-title-Greatest survey of them all!"]').should('exist')
    cy.get('[data-cy="organisation-survey-feedback-count-percentage-0/2"]').should('exist')
    cy.get('[data-cy="organisation-survey-responsible-persons-Greatest survey of them all!"]').should('exist')
    cy.get(
      '[data-cy="organisation-survey-responsible-persons-Greatest survey of them all!-chips-Correspondent Tester"]'
    ).should('exist')
    cy.get(
      '[data-cy="organisation-survey-responsible-persons-Greatest survey of them all!-chips-Tommi Testaaja"]'
    ).should('exist')
  })

  it('can edit organisation surveys after feedback period has started', () => {
    const today = new Date()
    const organisationCode = '500-K005'
    const organisationSurveyBody = {
      name: {
        fi: 'Uusi kysely',
        en: 'New survey',
        sv: '',
      },
      studentNumbers: ['211111112'],
      teacherIds: ['hy-hlo-111111112'],
      startDate: today,
      endDate: new Date().setDate(today.getDate() + 1),
    }

    cy.visit(`${baseUrl}/organisations/500-K005/organisation-surveys`)

    cy.createOrganisationSurvey(organisationCode, organisationSurveyBody)

    // Assert the survey data is correct
    cy.visit(`${baseUrl}/organisations/500-K005/organisation-surveys`)

    cy.get('[data-cy="organisation-survey-item-title-New survey"]').should('exist')
    cy.get('[data-cy="organisation-survey-feedback-count-percentage-0/1"]').should('exist')
    cy.get('[data-cy="organisation-survey-responsible-persons-New survey"]').should('exist')
    cy.get('[data-cy="organisation-survey-responsible-persons-New survey-chips-Correspondent Tester"]').should('exist')

    cy.giveOrganisationSurveyFeedback(studentRandom)

    // Visit the survey
    cy.get('[data-cy="organisation-survey-show-feedback-New survey"]').should('exist').click()
    cy.get('[data-cy="feedback-target-edit-organisation-survey"]').should('exist').click()

    // Add new teacher by email
    cy.get('[data-cy="formik-responsible-teacher-input-field"]').type('grp-toska+mockadmin@helsinki.fi')
    cy.get('.MuiAutocomplete-popper [role="listbox"] [role="option"]').contains('Matti Luukkainen').click()

    // Add students
    cy.get('[data-cy="formik-student-number-input-field"]').as('studentInput')
    cy.get('@studentInput').type('014895968{enter}')
    cy.get('[data-cy="formik-student-number-input-field-chip-014895968"]').should('exist')

    cy.get('[data-cy="organisation-survey-editor-save"]').click()

    // Assure the changes is visible
    cy.visit(`${baseUrl}/organisations/500-K005/organisation-surveys`)

    cy.get('[data-cy="organisation-survey-item-title-New survey"]').should('exist')
    cy.get('[data-cy="organisation-survey-feedback-count-percentage-1/2"]').should('exist')
    cy.get('[data-cy="organisation-survey-responsible-persons-New survey"]').should('exist')
    cy.get('[data-cy="organisation-survey-responsible-persons-New survey-chips-Correspondent Tester"]').should('exist')
    cy.get('[data-cy="organisation-survey-responsible-persons-New survey-chips-Matti Luukkainen"]').should('exist')
  })

  it('can not delete organisation surveys after feedback has been given', () => {
    const today = new Date()
    const organisationCode = '500-K005'
    const organisationSurveyBody = {
      name: {
        fi: 'Uusi kysely',
        en: 'New survey',
        sv: '',
      },
      studentNumbers: ['211111112'],
      teacherIds: ['hy-hlo-111111112'],
      startDate: today,
      endDate: new Date().setDate(today.getDate() + 1),
    }

    cy.visit(`${baseUrl}/organisations/500-K005/organisation-surveys`)

    cy.createOrganisationSurvey(organisationCode, organisationSurveyBody)

    cy.giveOrganisationSurveyFeedback(studentRandom)

    // Check that the view and edit buttons are there but delete button should not exist
    cy.get('[data-cy="organisation-survey-show-feedback-New survey"]').should('exist')
    cy.get('[data-cy="organisation-survey-show-results-New survey"]').should('exist')
    cy.get('[data-cy="organisation-survey-delete-New survey"]').should('not.exist')
  })

  it('can create questions for organisation survey', () => {
    cy.visit(`${baseUrl}/organisations/500-K005/organisation-surveys`)

    // Create a new survey with just the name given
    cy.get('[data-cy="organisation-surveys-add-new"]').click()
    cy.get('[data-cy="formik-locales-field-en-name"]').type('Test survey')

    // Add student Henri to the survey
    cy.get('[data-cy="formik-student-number-input-field"]').as('studentInput')
    cy.get('@studentInput').type('014895968{enter}')

    cy.get('[data-cy="organisation-survey-editor-save"]').click()

    // Add likert question to the survey
    cy.get('[data-cy="question-editor-add-question"]').click()
    cy.get('[data-cy="question-editor-type-menu-select-likert"]').click()
    cy.get('[id="likert-question-en-questions.0"]').clear().type('Rate the importance of testing')
    cy.get('[id="likert-description-en-questions.0"]').clear().type('Something something')

    cy.get('[data-cy="question-card-save-edit"]').click()

    // Add another question to the survey
    cy.get('[data-cy="question-editor-add-question"]').click()
    cy.get('[data-cy="question-editor-type-menu-select-single-choice"]').click()
    cy.get('[id="choice-question-en-questions.1"]').clear().type('What is your favorite type of testing')
    cy.get('[id="choice-description-en-questions.1"]').clear().type('Something something else')

    cy.get('[data-cy="option-editor-add-option"]').click()
    cy.get('[data-cy="option-editor-new-option-en-name.0"]').clear().type('E2E testing')
    cy.get('[data-cy="option-editor-add-option"]').click()
    cy.get('[data-cy="option-editor-new-option-en-name.1"]').clear().type('Unit testing')
    cy.get('[data-cy="option-editor-add-option"]').click()
    cy.get('[data-cy="option-editor-new-option-en-name.2"]').clear().type('Manual testing')

    cy.get('[data-cy="question-card-save-edit"]').click()
  })
})

describe('Students', () => {
  beforeEach(() => {
    cy.clearTestStudents()
    cy.clearOrganisationSurveys()
    cy.clearComputerScienceCorrespondents()

    cy.seedTestStudents()
    cy.seedComputerScienceCorrespondents()

    const today = new Date()
    const organisationCode = '500-K005'
    const organisationSurveyBody = {
      name: {
        fi: 'Uusi kysely',
        en: 'New survey',
        sv: '',
      },
      studentNumbers: ['014895968', '015303763', '015144922', '211111112'],
      teacherIds: ['hy-hlo-111111112'],
      startDate: today,
      endDate: new Date().setDate(today.getDate() + 7),
    }

    cy.createOrganisationSurvey(organisationCode, organisationSurveyBody)

    cy.loginAsStudent('henri')
  })

  it('can view ongoing organisation surveys and give organisation survey feedback', () => {
    cy.visit(`${baseUrl}/feedbacks`)

    cy.get('[data-cy$="New survey"]').should('exist')
    cy.get('[data-cy="feedback-item-give-feedback"]').should('exist').click()

    // Assert students does not see the edit button
    cy.get('[data-cy="feedback-target-edit-organisation-survey"]').should('not.exist')

    cy.get('[data-cy="feedback-target-give-feedback-tab"]').should('exist').click()
    cy.get('[data-cy="feedback-target-results-tab"]').should('not.exist')

    // Give the feedback
    cy.get('[data-cy=feedback-view-give-feedback]').click()
    cy.contains('Feedback has been given. Thank you for your feedback!')

    // New tabs are rendered when feedback was given
    cy.get('[data-cy="feedback-target-edit-feedback-tab"]').should('exist')
    cy.get('[data-cy="feedback-target-results-tab"]').should('exist').click()
    cy.get('[data-cy="feedback-target-results-thank-you"]').should('exist')
    cy.get('[data-cy="feedback-target-results-feedback-chart"]').should('exist')
    cy.get('[data-cy="feedback-target-results-multiple-choice-questions-0"]').should('exist')
    cy.get('[data-cy="feedback-target-results-open-questions-0"]').should('exist')

    cy.url().should('include', '/results')

    // Edit answer
    cy.get('[data-cy="feedback-target-edit-feedback-tab"]').click()
    cy.get('[data-cy=feedback-view-give-feedback]').click()
    cy.contains('Feedback has been given. Thank you for your feedback!')
    cy.url().should('include', '/results')
  })
})

describe('Responsible Teachers', () => {
  beforeEach(() => {
    cy.loginAsTeacher()
  })

  it.skip('can view own organisation surveys', () => {})
  it.skip('can edit organisation surveys', () => {})
})

describe('Admin Users', () => {
  beforeEach(() => {
    cy.loginAsAdmin()
  })

  it.skip('can delete organisation surveys after feedback has been given', () => {})
})
