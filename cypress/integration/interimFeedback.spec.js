import { studentRandom } from '../fixtures/headers'

const { baseUrl } = require('../support')

describe('Responsible Teachers', () => {
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
      studentNumbers: [],
      teacherIds: ['hy-hlo-51367956'],
      startDate: today,
      endDate: new Date().setDate(today.getDate() + 7),
    }

    cy.createOrganisationSurvey(organisationCode, organisationSurveyBody)

    // Login as Tommi Testaaja
    cy.loginAsSecondaryTeacher()
  })

  it('can view own organisation surveys if responsible teacher', () => {
    cy.visit(`${baseUrl}/courses`)

    // Visit the organisation survey where teacher is the responsible teacher
    cy.get('[data-cy="my-teaching-course-unit-accordion-500-K005-SRV"').should('exist').click()
    cy.get('[data-cy="my-teaching-feedback-target-item-link-New survey"]').should('exist').click()

    cy.url().should('include', '/feedback')

    // Assert that the feedback information is rendered correctly
    cy.get('[data-cy="feedback-target-primary-course-name"]').should('exist')
    cy.get('[data-cy="feedback-target-secondary-course-name"]').should('exist')
    cy.get('[data-cy="feedback-target-feedback-dates"]').should('exist')
    cy.get('[data-cy="feedback-target-edit-organisation-survey"]').should('exist')
    cy.get('[data-cy="feedback-target-feedback-count"]').should('exist')

    // Assert no initial student feedbacks
    cy.get('[data-cy="feedback-target-feedback-count-percentage-0/0"]').should('exist')

    // Assert correct teacher list is rendered
    cy.get('[data-cy="feedback-target-responsible-administrative-person-list"]').should('exist')
    cy.get('[data-cy="feedback-target-responsible-teacher-list"]').should('not.exist')
    cy.get('[data-cy="feedback-target-teacher-list"]').should('not.exist')

    // Assert that the links are rendered correctly
    cy.get('[data-cy="feedback-target-copy-student-link"]').should('exist')
    cy.get('[data-cy="feedback-target-organisation-link"]').should('not.exist')
    cy.get('[data-cy="feedback-target-course-summary-link"]').should('not.exist')
    cy.get('[data-cy="feedback-target-course-page-link"]').should('not.exist')
    cy.get('[data-cy="feedback-target-wiki-link"]').should('exist')
    cy.get('[data-cy="feedback-target-sisu-page-link"]').should('not.exist')
    cy.get('[data-cy="feedback-target-interim-feedback-parent-link"]').should('not.exist')

    // Assert that the tabs are rendered correctly
    cy.get('[data-cy="feedback-target-give-feedback-tab"]').should('exist').click()
    cy.get('[aria-label="Survey can no longer be edited after the feedback has opened"]').should('exist')
    cy.get('[data-cy="feedback-target-share-feedback-tab"]').should('exist').click()
    cy.get('[data-cy="feedback-target-results-tab"]').should('exist').click()
    cy.get('[data-cy="feedback-target-students-with-feedback-tab"]').should('exist').click()
  })

  it('can edit organisation surveys', () => {
    cy.visit(`${baseUrl}/courses`)

    // Edit the survey to add students and new responsible teacher
    cy.get('[data-cy="my-teaching-course-unit-accordion-500-K005-SRV"').should('exist').click()
    cy.get('[data-cy="my-teaching-feedback-target-item-link-New survey"]').should('exist').click()
    cy.get('[data-cy="feedback-target-edit-organisation-survey"]').should('exist').click()

    // Add new teacher
    cy.get('[data-cy="formik-responsible-teacher-input-field"]').type('Matti Luukkainen')
    cy.get('.MuiAutocomplete-popper [role="listbox"] [role="option"]').contains('Matti Luukkainen').click()

    // Add students
    cy.get('[data-cy="formik-student-number-input-field"]').as('studentInput')
    cy.get('@studentInput').type('014895968{enter}')
    cy.get('[data-cy="formik-student-number-input-field-chip-014895968"]').should('exist')
    cy.get('@studentInput').type('211111112{enter}')
    cy.get('[data-cy="formik-student-number-input-field-chip-211111112"]').should('exist')

    cy.get('[data-cy="organisation-survey-editor-save"]').click()

    // Assure the changes is visible
    cy.loginAsOrganisationCorrespondent()

    cy.visit(`${baseUrl}/organisations/500-K005/organisation-surveys`)

    cy.get('[data-cy="organisation-survey-item-title-New survey"]').should('exist')
    cy.get('[data-cy="organisation-survey-feedback-count-percentage-0/2"]').should('exist')
    cy.get('[data-cy="organisation-survey-responsible-persons-New survey"]').should('exist')
    cy.get('[data-cy="organisation-survey-responsible-persons-New survey-chips-Tommi Testaaja"]').should('exist')
    cy.get('[data-cy="organisation-survey-responsible-persons-New survey-chips-Matti Luukkainen"]').should('exist')
  })

  it('can not create/edit questions for ongoing organistaion survey', () => {
    cy.visit(`${baseUrl}/courses`)

    // Edit the survey to add students and new responsible teacher
    cy.get('[data-cy="my-teaching-course-unit-accordion-500-K005-SRV"').should('exist').click()
    cy.get('[data-cy="my-teaching-feedback-target-item-link-New survey"]').should('exist').click()

    cy.get('[aria-label="Survey can no longer be edited after the feedback has opened"]').should('exist')
  })

  it('can create questions for organisation survey', () => {
    const today = new Date()
    const organisationCode = '500-K005'
    const organisationSurveyBody = {
      name: {
        fi: 'Uusin kysely',
        en: 'Newest survey',
        sv: '',
      },
      studentNumbers: [],
      teacherIds: ['hy-hlo-51367956'],
      startDate: new Date().setDate(today.getDate() + 1),
      endDate: new Date().setDate(today.getDate() + 7),
    }

    cy.createOrganisationSurvey(organisationCode, organisationSurveyBody)

    cy.visit(`${baseUrl}/courses`)

    // Edit the survey to add students and new responsible teacher
    cy.get('[data-cy="my-teaching-course-unit-accordion-500-K005-SRV"').should('exist').click({ multiple: true })
    cy.get('[data-cy="my-teaching-feedback-target-item-link-Newest survey"]').should('exist').click()

    cy.get('[data-cy="feedback-target-settings-tab"]').should('exist').click()

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

    // Assert that the feedback page got updated
    cy.visit(`${baseUrl}/feedbacks`)

    // Awaiting tab check
    cy.get('[data-cy="my-feedbacks-waiting-tab"]').should('exist').click()
    cy.get('[data-cy$="New survey"]').should('not.exist')
    cy.get('[data-cy="my-feedbacks-no-feedbacks"]').should('exist')

    // Given tab check
    cy.get('[data-cy="my-feedbacks-given-tab"]').should('exist').click()
    cy.get('[data-cy$="New survey"]').should('exist')
    cy.get('[data-cy="my-feedbacks-no-feedbacks"]').should('not.exist')
  })
})

describe('Admin Users', () => {
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
      studentNumbers: ['211111112'],
      teacherIds: ['hy-hlo-111111112'],
      startDate: today,
      endDate: new Date().setDate(today.getDate() + 1),
    }

    cy.createOrganisationSurvey(organisationCode, organisationSurveyBody)

    cy.loginAsAdmin()
  })

  it('can create questions for organisation survey regardles of ongoing feedback', () => {
    cy.visit(`${baseUrl}/organisations/500-K005/organisation-surveys`)

    cy.get('[data-cy="organisation-survey-show-feedback-New survey"]').should('exist').click()

    cy.get('[data-cy="feedback-target-settings-tab"]').should('exist').click()

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

  it('can delete organisation surveys after feedback has been given', () => {
    cy.giveOrganisationSurveyFeedback(studentRandom)

    cy.visit(`${baseUrl}/organisations/500-K005/organisation-surveys`)
    cy.get('[data-cy="organisation-surveys-no-surveys-alert"]').should('not.exist')

    cy.on('window:confirm', str => {
      expect(str).to.eq('Are you sure you want to remove this programme survey?')
    })

    // Check that the survey is there and delete it
    cy.get('[data-cy="organisation-survey-show-feedback-New survey"]').should('exist')
    cy.get('[data-cy="organisation-survey-show-results-New survey"]').should('exist')

    // Assert that the survey has feedback given
    cy.get('[data-cy="organisation-survey-feedback-count-percentage-1/1"]').should('exist')

    // Remove the survey
    cy.get('[data-cy="organisation-survey-delete-New survey"]').should('exist').click()

    // Assert that the survey got deleted
    cy.get('[data-cy="organisation-survey-show-feedback-New survey"]').should('not.exist')
    cy.get('[data-cy="organisation-surveys-no-surveys-alert"]').should('be.visible')

    // Assert that the survey also got removed from the students page
    cy.loginAsStudent('random')

    cy.visit(`${baseUrl}/feedbacks`)

    // Awaiting tab check
    cy.get('[data-cy="my-feedbacks-waiting-tab"]').should('exist').click()
    cy.get('[data-cy$="New survey"]').should('not.exist')
    cy.get('[data-cy="my-feedbacks-no-feedbacks"]').should('exist')

    // Given tab check
    cy.get('[data-cy="my-feedbacks-given-tab"]').should('exist').click()
    cy.get('[data-cy$="New survey"]').should('not.exist')
    cy.get('[data-cy="my-feedbacks-no-feedbacks"]').should('exist')

    // Closed tab check
    cy.get('[data-cy="my-feedbacks-closed-tab"]').should('exist').click()
    cy.get('[data-cy$="New survey"]').should('not.exist')
    cy.get('[data-cy="my-feedbacks-no-feedbacks"]').should('exist')
  })
})
