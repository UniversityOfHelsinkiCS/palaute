/// <reference types="Cypress" />

import {
  admin,
  getFullName,
  organisationCorrespondent,
  student,
  studentHenri,
  studentMiko,
  studentRandom,
  studentVeikko,
  teacher,
} from '../fixtures/headers'

describe('Feedback Correspondents', () => {
  beforeEach(() => {
    cy.seedTestOrgCorrespondent(organisationCorrespondent)

    cy.loginAs(organisationCorrespondent)
  })

  it('can visit organisation survey page', () => {
    cy.visit(`/organisations/TEST_ORG/settings`)

    cy.contains('Programme surveys').click()

    cy.get('[data-cy="organisation-surveys-add-new"]').should('be.visible')

    cy.get('[data-cy="organisation-surveys-no-surveys-alert"]').should('be.visible')
  })

  it('can access new survey window and the form is rendered correctly', () => {
    cy.visit(`/organisations/TEST_ORG/organisation-surveys`)

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
    cy.visit(`/organisations/TEST_ORG/organisation-surveys`)

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
    cy.get('@studentInput').type('010000001{enter}')
    cy.get('@studentInput').type('010000002 ')
    cy.get('@studentInput').type('010000003;')
    cy.get('@studentInput').type('010000004,')

    cy.get('[data-cy="formik-student-number-input-field-chip-010000001"]').should('exist')
    cy.get('[data-cy="formik-student-number-input-field-chip-010000002"]').should('exist')
    cy.get('[data-cy="formik-student-number-input-field-chip-010000003"]').should('exist')
    cy.get('[data-cy="formik-student-number-input-field-chip-010000004"]').should('exist')

    cy.get('[data-cy="organisation-survey-editor-save"]').click()

    // Assert that the survey was created
    cy.visit(`/organisations/TEST_ORG/organisation-surveys`)

    // Because there is no way of getting the organistaion survey's id
    // that was created above we just have to check some elements are rendered.
    cy.get(`[data-cy^="organisation-survey-item-title-"]`).should('exist')
    cy.get(`[data-cy^="organisation-survey-not-open-"]`).should('exist')
    cy.get(`[data-cy^="organisation-survey-period-info-"]`).should('exist')
    cy.get(`[data-cy^="organisation-survey-feedback-count-"]`).should('exist')
    cy.get(`[data-cy^="organisation-survey-feedback-count-percentage-"]`).should('exist').contains('0/4')
    cy.get(`[data-cy^="organisation-survey-responsible-persons-"]`)
      .should('exist')
      .children('.MuiChip-root')
      .should('have.length', 2)

    cy.get(`[data-cy^="organisation-survey-show-feedback-"]`).should('exist')
    cy.get(`[data-cy^="organisation-survey-show-results-"]`).should('not.exist')
    cy.get(`[data-cy^="organisation-survey-delete-"]`).should('exist')
  })

  it('can not create survey with validation errors', () => {
    cy.visit(`/organisations/TEST_ORG/organisation-surveys`)

    // try to save a new survey without inserting any information
    cy.get('[data-cy="organisation-surveys-add-new"]').click()
    cy.get('[data-cy="organisation-survey-editor-save"]').click()

    cy.get('[data-cy="formik-locales-field-fi-name"]').contains('p', 'This field is required')
    cy.get('[data-cy="formik-locales-field-sv-name"]').contains('p', 'This field is required')
    cy.get('[data-cy="formik-locales-field-en-name"]').contains('p', 'This field is required')

    // try to insert the logged user's student number to the stundent number field and assert that the saving fails
    cy.get('[data-cy="formik-locales-field-en-name"]').type('Test survey')

    cy.get('[data-cy="formik-student-number-input-field"]').as('studentInput')
    cy.get('@studentInput').type('010000006{enter}')
    cy.get('[data-cy="formik-student-number-input-field-chip-010000006"]').should('exist')

    cy.get('[data-cy="organisation-survey-editor-save"]').click()

    cy.get('@studentInput').contains('p', 'Responsible person can not be a student at the same time')

    // try to add student as the responsible teacher
    cy.get('[data-cy="formik-responsible-teacher-input-field"]').type('henri.testaaja@helsinki.fi')
    cy.get('.MuiAutocomplete-popper [role="listbox"] [role="option"]').should('not.exist')

    // try to add invalid student
    cy.get('[data-cy="formik-student-number-input-field-chip-010000006"]')
      .find('[data-testid="CancelIcon"]')
      .should('be.visible')
      .click()

    cy.get('@studentInput').clear().type('0148959{enter}')
    cy.get('[data-cy="formik-student-number-input-field-chip-0148959"]').should('exist')

    cy.get('[data-cy="organisation-survey-editor-save"]').click()

    cy.get('@studentInput').contains('p', 'Please check the indicated invalid student numbers')
  })

  it('can edit organisation surveys', () => {
    cy.visit(`/organisations/TEST_ORG/organisation-surveys`)

    // Create a new survey with just the name given
    cy.get('[data-cy="organisation-surveys-add-new"]').click()
    cy.get('[data-cy="formik-locales-field-en-name"]').type('Test survey')

    cy.get('[data-cy="organisation-survey-editor-save"]').click()
    cy.visit(`/organisations/TEST_ORG/organisation-surveys`)

    // Assure that the survey does not have any students and only one responsible teacher
    cy.get('[data-cy^="organisation-survey-item-title-"]').should('exist')
    cy.get('[data-cy^="organisation-survey-feedback-count-percentage-"]').should('exist').contains('0/0')
    cy.get('[data-cy^="organisation-survey-responsible-persons-"]').should('exist')
    cy.get(`[data-cy^="organisation-survey-responsible-persons-"]`)
      .should('exist')
      .children('.MuiChip-root')
      .should('have.length', 1)
      .should('contain', 'Correspondent Tester')
      .should('not.contain', 'Tommi Testaaja')

    // Edit the survey to add students and new responsible teacher
    cy.get('[data-cy^="organisation-survey-show-feedback-"').should('exist').click()
    cy.get('[data-cy="feedback-target-edit-organisation-survey"]').should('exist').click()

    // Add new teacher
    cy.get('[data-cy="formik-responsible-teacher-input-field"]').type('Tommi Testaaja')
    cy.get('.MuiAutocomplete-popper [role="listbox"] [role="option"]').contains('Tommi Testaaja').click()

    // Add students
    cy.get('[data-cy="formik-student-number-input-field"]').as('studentInput')
    cy.get('@studentInput').type('010000001{enter}')
    cy.get('[data-cy="formik-student-number-input-field-chip-010000001"]').should('exist')
    cy.get('@studentInput').type('010000002{enter}')
    cy.get('[data-cy="formik-student-number-input-field-chip-010000002"]').should('exist')

    cy.get('[data-cy="organisation-survey-editor-save"]').click()

    // Assure the changes is visible
    cy.visit(`/organisations/TEST_ORG/organisation-surveys`)

    cy.get('[data-cy^="organisation-survey-item-title-"]').should('exist').contains('Test survey')
    cy.get('[data-cy^="organisation-survey-feedback-count-percentage-"]').should('exist').contains('0/2')
    cy.get('[data-cy^="organisation-survey-responsible-persons-"]').should('exist')
    cy.get(`[data-cy^="organisation-survey-responsible-persons-"]`)
      .should('exist')
      .children('.MuiChip-root')
      .should('have.length', 2)
      .should('contain', 'Correspondent Tester')
      .should('contain', 'Tommi Testaaja')

    // Edit the survey name
    cy.get('[data-cy^="organisation-survey-show-feedback-"').should('exist').click()
    cy.get('[data-cy="feedback-target-edit-organisation-survey"]').should('exist').click()

    cy.get('[data-cy="formik-locales-field-en-name"]').clear().type('Greatest survey of them all!')

    cy.get('[data-cy="organisation-survey-editor-save"]').click()

    // Assure that only the name changed
    cy.visit(`/organisations/TEST_ORG/organisation-surveys`)

    cy.get('[data-cy^="organisation-survey-item-title-"]').should('not.contain', 'Test survey')
    cy.get('[data-cy^="organisation-survey-item-title-"]').should('contain', 'Greatest survey of them all!')
    cy.get('[data-cy^="organisation-survey-feedback-count-percentage-"]').should('exist').contains('0/2')
    cy.get('[data-cy^="organisation-survey-responsible-persons-"]').should('exist')
    cy.get(`[data-cy^="organisation-survey-responsible-persons-"]`)
      .should('exist')
      .children('.MuiChip-root')
      .should('have.length', 2)
      .should('contain', 'Correspondent Tester')
      .should('contain', 'Tommi Testaaja')
  })

  it('can edit organisation surveys after feedback period has started', () => {
    const today = new Date()
    const organisationCode = 'TEST_ORG'
    const organisationSurveyBody = {
      name: {
        fi: 'Uusi kysely',
        en: 'New survey',
        sv: '',
      },
      studentNumbers: [],
      teacherIds: [teacher.hyPersonSisuId],
      startDate: today,
      endDate: new Date().setDate(today.getDate() + 1),
    }

    cy.visit(`/organisations/TEST_ORG/organisation-surveys`)

    cy.createOrganisationSurvey(organisationCode, organisationSurveyBody)

    // Assert the survey data is correct
    cy.visit(`/organisations/TEST_ORG/organisation-surveys`)

    cy.get('@organisationSurvey').then(organisationSurvey => {
      cy.get(`[data-cy="organisation-survey-item-title-${organisationSurvey.id}"]`).should('exist')
      cy.get(`[data-cy="organisation-survey-responsible-persons-${organisationSurvey.id}"]`).should('exist')
      cy.get(`[data-cy^="organisation-survey-responsible-persons-${organisationSurvey.id}"]`)
        .should('exist')
        .children('.MuiChip-root')
        .should('have.length', 1)
        .should('contain', getFullName(teacher))
        .should('not.contain', getFullName(admin))

      // Visit the survey
      cy.get(`[data-cy="organisation-survey-show-feedback-${organisationSurvey.id}"]`).should('exist').click()
      cy.get('[data-cy="feedback-target-edit-organisation-survey"]').should('exist').click()
    })

    // Add new teacher by email
    cy.get('[data-cy="formik-responsible-teacher-input-field"]').type(organisationCorrespondent.mail)
    cy.get('.MuiAutocomplete-popper [role="listbox"] [role="option"]')
      .contains(getFullName(organisationCorrespondent))
      .click()

    // Add students
    cy.get('[data-cy="formik-student-number-input-field"]').as('studentInput')
    cy.get('@studentInput').type(`${student.studentNumber}{enter}`)
    cy.get(`[data-cy="formik-student-number-input-field-chip-${student.studentNumber}"]`).should('exist')

    cy.get('[data-cy="organisation-survey-editor-save"]').click()

    // Assure the changes is visible
    cy.giveOrganisationSurveyFeedback(student).then(() => {
      cy.get('@organisationSurvey').then(organisationSurvey => {
        cy.visit(`/organisations/TEST_ORG/organisation-surveys`)

        cy.get(`[data-cy="organisation-survey-item-title-${organisationSurvey.id}"]`).should('exist')
        cy.get(`[data-cy="organisation-survey-feedback-count-percentage-${organisationSurvey.id}"]`)
          .should('exist')
          .contains('1/1')
        cy.get(`[data-cy="organisation-survey-responsible-persons-${organisationSurvey.id}"]`).should('exist')
        cy.get(`[data-cy^="organisation-survey-responsible-persons-${organisationSurvey.id}"]`)
          .should('exist')
          .children('.MuiChip-root')
          .should('have.length', 2)
          .should('contain', getFullName(teacher))
          .should('contain', getFullName(organisationCorrespondent))
      })
    })
  })

  it('can not delete organisation surveys after feedback has been given', () => {
    const today = new Date()
    const organisationCode = 'TEST_ORG'
    const organisationSurveyBody = {
      name: {
        fi: 'Uusi kysely',
        en: 'New survey',
        sv: '',
      },
      studentNumbers: [student.studentNumber],
      teacherIds: [teacher.hyPersonSisuId],
      startDate: today,
      endDate: new Date().setDate(today.getDate() + 1),
    }

    cy.visit(`/organisations/TEST_ORG/organisation-surveys`)

    cy.createOrganisationSurvey(organisationCode, organisationSurveyBody)

    cy.giveOrganisationSurveyFeedback(student)
    cy.get('@organisationSurvey').then(organisationSurvey => {
      // Check that the view and edit buttons are there but delete button should not exist
      cy.get(`[data-cy="organisation-survey-show-feedback-${organisationSurvey.id}"]`).should('exist')
      cy.get(`[data-cy="organisation-survey-show-results-${organisationSurvey.id}"]`).should('exist')
      cy.get(`[data-cy="organisation-survey-delete-${organisationSurvey.id}"]`).should('not.exist')
    })
  })

  it('can view own organisations organisation surveys', () => {
    const today = new Date()
    const organisationCode = 'TEST_ORG'
    const organisationSurveyBody = {
      name: {
        fi: 'Uusi kysely',
        en: 'New survey',
        sv: '',
      },
      studentNumbers: [student.studentNumber],
      teacherIds: [organisationCorrespondent.hyPersonSisuId],
      startDate: today,
      endDate: new Date().setDate(today.getDate() + 1),
    }

    cy.visit(`/organisations/TEST_ORG/organisation-surveys`)

    cy.createOrganisationSurvey(organisationCode, organisationSurveyBody)

    cy.giveOrganisationSurveyFeedback(student)

    cy.visit(`/organisations/TEST_ORG/organisation-surveys`)

    cy.get('@organisationSurvey').then(organisationSurvey => {
      cy.get(`[data-cy="organisation-survey-show-feedback-${organisationSurvey.id}"]`).should('exist').click()
    })

    // Assert that the feedback information is rendered correctly
    cy.get('[data-cy="feedback-target-primary-course-name"]').should('exist')
    cy.get('[data-cy="feedback-target-secondary-course-name"]').should('exist')
    cy.get('[data-cy="feedback-target-feedback-dates"]').should('exist')
    cy.get('[data-cy="feedback-target-edit-organisation-survey"]').should('exist')
    cy.get('[data-cy="feedback-target-feedback-count"]').should('exist')

    // Assert no initial student feedbacks
    cy.get('[data-cy="feedback-target-feedback-count-percentage"]').should('exist').contains('1/1')

    // Assert correct teacher list is rendered
    cy.get('[data-cy="feedback-target-responsible-administrative-person-list"]').should('exist')
    cy.get('[data-cy="feedback-target-responsible-teacher-list"]').should('not.exist')
    cy.get('[data-cy="feedback-target-teacher-list"]').should('not.exist')

    // Assert that the links are rendered correctly
    cy.get('[data-cy="feedback-target-copy-student-link"]').should('exist')
    cy.get('[data-cy="feedback-target-organisation-link"]').should('exist')
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

  it('can create questions for organisation survey', () => {
    cy.visit(`/organisations/TEST_ORG/organisation-surveys`)

    // Create a new survey with just the name given
    cy.get('[data-cy="organisation-surveys-add-new"]').click()
    cy.get('[data-cy="formik-locales-field-en-name"]').type('Test survey')

    // Add student Henri to the survey
    cy.get('[data-cy="formik-student-number-input-field"]').as('studentInput')
    cy.get('@studentInput').type(`${studentHenri.studentNumber}{enter}`)

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

  it('can add students from courses and from student field and delete the course afterwards', () => {
    const today = new Date()
    const organisationCode = 'TEST_ORG'
    const organisationSurveyBody = {
      name: {
        fi: 'Uusi kysely',
        en: 'New survey',
        sv: 'Katten i vatten',
      },
      studentNumbers: [student.studentNumber],
      teacherIds: [organisationCorrespondent.hyPersonSisuId],
      startDate: today,
      endDate: new Date().setDate(today.getDate() + 1),
      courseRealisationIds: ['norppa-test-course-unit-realisation-id-2'],
    }

    cy.createFeedbackTarget({ extraStudents: 9 })

    cy.createOrganisationSurvey(organisationCode, organisationSurveyBody)

    cy.visit(`/organisations/TEST_ORG/organisation-surveys`)
    cy.get('@organisationSurvey').then(organisationSurvey => {
      cy.get(`[data-cy="organisation-survey-show-feedback-${organisationSurvey.id}"]`).should('exist').click()
    })

    cy.get('[data-cy="feedback-target-edit-organisation-survey"').should('exist').click()

    cy.get('[data-cy="formik-student-number-input-field"]').as('studentInput')
    cy.get('@studentInput').type(`${studentHenri.studentNumber}{enter}`)
    cy.get('[data-cy="organisation-survey-editor-save"]').click()

    cy.get('[data-cy="feedback-target-students-with-feedback-tab"]').should('exist').click()
    cy.contains('henri.testaaja@helsinki.fi').should('exist')

    cy.get('[data-cy="feedback-target-edit-organisation-survey"]').should('exist').click()

    cy.get('[data-cy="formik-course-input-field-chip-norppa-test-course-unit-realisation-id-2"]').as('courseChip')
    cy.get('@courseChip').find('[data-testId="CancelIcon"]').should('exist').click()
    cy.get('[data-cy="organisation-survey-editor-save"]').click()

    cy.get('[data-cy="feedback-target-results-tab"]').should('exist').click()

    cy.get('[data-cy="feedback-target-students-with-feedback-tab"]').should('exist').click()
    cy.contains('henri.testaaja@helsinki.fi').should('exist')
    cy.contains('opiskelija@toska.fi').should('not.exist')
  })
})

describe('Responsible Teachers', () => {
  beforeEach(() => {
    cy.seedTestOrgCorrespondent(organisationCorrespondent)
    const today = new Date()
    const organisationCode = 'TEST_ORG'
    const organisationSurveyBody = {
      name: {
        fi: 'Uusi kysely',
        en: 'New survey',
        sv: '',
      },
      studentNumbers: [],
      teacherIds: [teacher.hyPersonSisuId],
      startDate: today,
      endDate: new Date().setDate(today.getDate() + 7),
    }

    cy.createOrganisationSurvey(organisationCode, organisationSurveyBody)

    // Login as Tommi Testaaja
    cy.loginAs(teacher)
  })

  it('can view own organisation surveys if responsible teacher', () => {
    cy.visit(`/courses`)

    cy.get('[data-cy="course-unit-group-title-Organisation surveys"').should('exist')
    cy.get('[data-cy="course-unit-group-expand-more"').should('exist').click()

    // Visit the organisation survey where teacher is the responsible teacher
    cy.get('[data-cy="my-teaching-course-unit-item-TEST_ORG-SRV"').should('exist').click()
    cy.get('@organisationSurvey').then(organisationSurvey => {
      cy.get(`[data-cy="my-teaching-feedback-target-item-link-${organisationSurvey.id}"]`).should('exist').click()
    })

    cy.url().should('include', '/feedback')

    // Assert that the feedback information is rendered correctly
    cy.get('[data-cy="feedback-target-primary-course-name"]').should('exist')
    cy.get('[data-cy="feedback-target-secondary-course-name"]').should('exist')
    cy.get('[data-cy="feedback-target-feedback-dates"]').should('exist')
    cy.get('[data-cy="feedback-target-edit-organisation-survey"]').should('exist')
    cy.get('[data-cy="feedback-target-feedback-count"]').should('exist')

    // Assert no initial student feedbacks
    cy.get('[data-cy="feedback-target-feedback-count-percentage"]').should('exist').contains('0/0')

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
    cy.visit(`/courses`)

    cy.get('[data-cy="course-unit-group-title-Organisation surveys"').should('exist')
    cy.get('[data-cy="course-unit-group-expand-more"').should('exist').click()

    // Edit the survey to add students and new responsible teacher
    cy.get('[data-cy="my-teaching-course-unit-item-TEST_ORG-SRV"').should('exist').click()
    cy.get('@organisationSurvey').then(organisationSurvey => {
      cy.get(`[data-cy="my-teaching-feedback-target-item-link-${organisationSurvey.id}"]`).should('exist').click()
    })

    cy.get('[data-cy="feedback-target-edit-organisation-survey"]').should('exist').click()

    // Add new teacher
    cy.get('[data-cy="formik-responsible-teacher-input-field"]').type('Matti Luukkainen')
    cy.get('.MuiAutocomplete-popper [role="listbox"] [role="option"]').contains('Matti Luukkainen').click()

    // Add students
    cy.get('[data-cy="formik-student-number-input-field"]').as('studentInput')
    cy.get('@studentInput').type(`${student.studentNumber}{enter}`)
    cy.get(`[data-cy="formik-student-number-input-field-chip-${student.studentNumber}"]`).should('exist')
    cy.get('@studentInput').type(`${studentHenri.studentNumber}{enter}`)
    cy.get(`[data-cy="formik-student-number-input-field-chip-${studentHenri.studentNumber}"]`).should('exist')

    cy.get('[data-cy="organisation-survey-editor-save"]').click()

    // Assure the changes is visible
    cy.loginAs(organisationCorrespondent)

    cy.visit(`/organisations/TEST_ORG/organisation-surveys`)

    cy.get('@organisationSurvey').then(organisationSurvey => {
      cy.get(`[data-cy^="organisation-survey-item-title-${organisationSurvey.id}"]`).should('exist')
      cy.get(`[data-cy^="organisation-survey-feedback-count-percentage-${organisationSurvey.id}"]`)
        .should('exist')
        .contains('0/2')
      cy.get(`[data-cy^="organisation-survey-responsible-persons-${organisationSurvey.id}"]`)
        .should('exist')
        .children('.MuiChip-root')
        .should('have.length', 2)
        .should('contain', 'Matti Luukkainen')
        .should('contain', 'Tommi Testaaja')
    })
  })

  it('can not create/edit questions for ongoing organistaion survey', () => {
    cy.visit(`/courses`)

    cy.get('[data-cy="course-unit-group-title-Organisation surveys"').should('exist')
    cy.get('[data-cy="course-unit-group-expand-more"').should('exist').click()

    // Edit the survey to add students and new responsible teacher
    cy.get('[data-cy="my-teaching-course-unit-item-TEST_ORG-SRV"').should('exist').click()
    cy.get('@organisationSurvey').then(organisationSurvey => {
      cy.get(`[data-cy="my-teaching-feedback-target-item-link-${organisationSurvey.id}"]`).should('exist').click()
    })

    cy.get('[aria-label="Survey can no longer be edited after the feedback has opened"]').should('exist')
  })

  it.only('can create questions for organisation survey', () => {
    const today = new Date()
    const organisationCode = 'TEST_ORG'
    const organisationSurveyBody = {
      name: {
        fi: 'Uusin kysely',
        en: 'Newest survey',
        sv: '',
      },
      studentNumbers: [],
      teacherIds: [teacher.hyPersonSisuId],
      startDate: new Date().setDate(today.getDate() + 1),
      endDate: new Date().setDate(today.getDate() + 7),
    }

    cy.createOrganisationSurvey(organisationCode, organisationSurveyBody)

    cy.visit(`/courses`)

    cy.get('[data-cy="my-teaching-upcoming-tab"').should('exist').click()

    cy.get('[data-cy="course-unit-group-title-Organisation surveys"').should('exist')
    cy.get('[data-cy="course-unit-group-expand-more"').should('exist').click()

    // Edit the survey to add students and new responsible teacher
    cy.get('[data-cy="my-teaching-course-unit-accordion-TEST_ORG-SRV"').should('exist').click()

    cy.get('@organisationSurvey').then(organisationSurvey => {
      cy.get(`[data-cy="my-teaching-feedback-target-item-link-${organisationSurvey.id}"]`).should('exist').click()
    })

    cy.get('[data-cy="feedback-target-settings-tab"]').should('exist').click()

    // Add likert question to the survey
    cy.get('[data-cy="question-editor-add-question"]').click()
    cy.get('[data-cy="question-editor-type-menu-select-likert"]').click()
    cy.get('[id="likert-question-en-questions.0"]').as('likertQuestion').clear()
    cy.get('@likertQuestion').type('Rate the importance of testing')

    cy.get('[id="likert-description-en-questions.0"]').as('likertDescription').clear()
    cy.get('@likertDescription').type('Something something')

    cy.get('[data-cy="question-card-save-edit"]').click()

    // Add another question to the survey
    cy.get('[data-cy="question-editor-add-question"]').click()
    cy.get('[data-cy="question-editor-type-menu-select-single-choice"]').click()

    cy.get('[id="choice-question-en-questions.1"]').as('choiceQuestion').clear()
    cy.get('@choiceQuestion').type('What is your favorite type of testing')

    cy.get('[id="choice-description-en-questions.1"]').as('choiceDescription').clear()
    cy.get('@choiceDescription').type('Something something else')

    cy.get('[data-cy="option-editor-add-option"]').click()
    cy.get('[data-cy="option-editor-new-option-en-name.0"]').as('option0').clear()
    cy.get('@option0').type('E2E testing')

    cy.get('[data-cy="option-editor-add-option"]').click()
    cy.get('[data-cy="option-editor-new-option-en-name.1"]').as('option1').clear()
    cy.get('@option1').type('Unit testing')

    cy.get('[data-cy="option-editor-add-option"]').click()
    cy.get('[data-cy="option-editor-new-option-en-name.2"]').as('option2').clear()
    cy.get('@option2').type('Manual testing')

    cy.get('[data-cy="question-card-save-edit"]').click()
  })

  it('can add students after creation and student count increases', () => {
    cy.visit(`/courses`)

    cy.get('[data-cy="course-unit-group-title-Organisation surveys"').should('exist')
    cy.get('[data-cy="course-unit-group-expand-more"').should('exist').click()

    // Edit the survey to add students and new responsible teacher
    cy.get('[data-cy="my-teaching-course-unit-item-TEST_ORG-SRV"').should('exist').click()
    cy.get('@organisationSurvey').then(organisationSurvey => {
      cy.get(`[data-cy="my-teaching-feedback-target-item-link-${organisationSurvey.id}"]`).should('exist').click()
    })

    cy.get('[data-cy="feedback-target-edit-organisation-survey"]').should('exist').click()

    // Add student
    cy.get('[data-cy="formik-student-number-input-field"]').as('studentInput')
    cy.get('@studentInput').type(`${student.studentNumber}{enter}`)

    cy.get('[data-cy="organisation-survey-editor-save"]').click()

    cy.get('[data-cy="feedback-target-feedback-count-percentage"]').should('exist').contains('0/1')
  })
})

describe('Students', () => {
  beforeEach(() => {
    cy.seedTestOrgCorrespondent(organisationCorrespondent)

    const today = new Date()
    const organisationCode = 'TEST_ORG'
    const organisationSurveyBody = {
      name: {
        fi: 'Uusi kysely',
        en: 'New survey',
        sv: '',
      },
      studentNumbers: [
        student.studentNumber,
        studentHenri.studentNumber,
        studentMiko.studentNumber,
        studentVeikko.studentNumber,
        studentRandom.studentNumber,
      ],
      teacherIds: [teacher.hyPersonSisuId],
      startDate: today,
      endDate: new Date().setDate(today.getDate() + 7),
    }

    cy.createOrganisationSurvey(organisationCode, organisationSurveyBody)

    cy.loginAs(studentHenri)
  })

  it('can view ongoing organisation surveys and give organisation survey feedback', () => {
    cy.visit(`/feedbacks`)

    cy.get('@organisationSurvey').then(organisationSurvey => {
      cy.get(`[data-cy="feedback-item-${organisationSurvey.id}"]`).should('exist')
    })

    cy.get('[data-cy="feedback-item-give-feedback"]').should('exist').click()

    // Assert students does not see the edit button
    cy.get('[data-cy="feedback-target-edit-organisation-survey"]').should('not.exist')

    cy.get('[data-cy="feedback-target-give-feedback-tab"]').should('exist').click()
    cy.get('[data-cy="feedback-target-results-tab"]').should('not.exist')

    // Give the feedback
    cy.get('[data-cy=feedback-view-give-feedback]').click()
    cy.contains('Feedback has been given. Thank you for your feedback!')

    // New tabs are rendered when feedback was given
    cy.get('[data-cy="feedback-target-results-feedback-chart"]').should('exist')

    // Should navigate to the results tab
    cy.url().should('include', '/results')

    // Edit answer
    cy.get('[data-cy="feedback-target-edit-feedback-tab"]').click()
    cy.get('[data-cy=feedback-view-give-feedback]').click()
    cy.contains('Feedback has been given. Thank you for your feedback!')
    cy.url().should('include', '/results')

    // Assert that the feedback page got updated
    cy.visit(`/feedbacks`)

    cy.get('@organisationSurvey').then(organisationSurvey => {
      // Awaiting tab check
      cy.get('[data-cy="my-feedbacks-waiting-tab"]').should('exist').click()
      cy.get(`[data-cy="feedback-item-${organisationSurvey.id}"]`).should('not.exist')
      cy.get('[data-cy="my-feedbacks-no-feedbacks"]').should('exist')

      // Given tab check
      cy.get('[data-cy="my-feedbacks-given-tab"]').should('exist').click()
      cy.get(`[data-cy="feedback-item-${organisationSurvey.id}"]`).should('exist')
      cy.get('[data-cy="my-feedbacks-no-feedbacks"]').should('not.exist')
    })
  })
})

describe('Admin Users', () => {
  beforeEach(() => {
    const today = new Date()
    const organisationCode = 'TEST_ORG'
    const organisationSurveyBody = {
      name: {
        fi: 'Uusi kysely',
        en: 'New survey',
        sv: '',
      },
      studentNumbers: [student.studentNumber],
      teacherIds: [teacher.hyPersonSisuId],
      startDate: today,
      endDate: new Date().setDate(today.getDate() + 1),
    }

    cy.createOrganisationSurvey(organisationCode, organisationSurveyBody)

    cy.loginAs(admin)
  })

  it('can create questions for organisation survey regardles of ongoing feedback', () => {
    cy.visit(`/organisations/TEST_ORG/organisation-surveys`)

    cy.get('@organisationSurvey').then(organisationSurvey => {
      cy.get(`[data-cy="organisation-survey-show-feedback-${organisationSurvey.id}"]`).should('exist').click()
    })

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
    cy.giveOrganisationSurveyFeedback(student)

    cy.visit(`/organisations/TEST_ORG/organisation-surveys`)
    cy.get('[data-cy="organisation-surveys-no-surveys-alert"]').should('not.exist')

    cy.on('window:confirm', str => {
      expect(str).to.eq('Are you sure you want to remove this programme survey?')
    })

    cy.get('@organisationSurvey').then(organisationSurvey => {
      // Check that the survey is there and delete it
      cy.get(`[data-cy="organisation-survey-show-feedback-${organisationSurvey.id}"]`).should('exist')
      cy.get(`[data-cy="organisation-survey-show-results-${organisationSurvey.id}"]`).should('exist')

      // Assert that the survey has feedback given
      cy.get(`[data-cy="organisation-survey-feedback-count-percentage-${organisationSurvey.id}"]`)
        .should('exist')
        .contains('1/1')

      // Remove the survey
      cy.get(`[data-cy="organisation-survey-delete-${organisationSurvey.id}"]`).should('exist').click()

      // Assert that the survey got deleted
      cy.get(`[data-cy="organisation-survey-show-feedback-${organisationSurvey.id}"]`).should('not.exist')
    })

    cy.get('[data-cy="organisation-surveys-no-surveys-alert"]').should('be.visible')

    // Assert that the survey also got removed from the students page
    cy.loginAs(student)

    cy.visit(`/feedbacks`)

    cy.get('@organisationSurvey').then(organisationSurvey => {
      // Awaiting tab check
      cy.get('[data-cy="my-feedbacks-waiting-tab"]').should('exist').click()
      cy.get(`[data-cy="feedback-item-${organisationSurvey.id}"]`).should('not.exist')
      cy.get('[data-cy="my-feedbacks-no-feedbacks"]').should('exist')

      // Given tab check
      cy.get('[data-cy="my-feedbacks-given-tab"]').should('exist').click()
      cy.get(`[data-cy="feedback-item-${organisationSurvey.id}"]`).should('not.exist')
      cy.get('[data-cy="my-feedbacks-no-feedbacks"]').should('exist')

      // Closed tab check
      cy.get('[data-cy="my-feedbacks-closed-tab"]').should('exist').click()
      cy.get(`[data-cy="feedback-item-${organisationSurvey.id}"]`).should('not.exist')
      cy.get('[data-cy="my-feedbacks-no-feedbacks"]').should('exist')
    })
  })
})
