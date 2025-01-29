/* eslint-disable cypress/unsafe-to-chain-command */
/// <reference types="Cypress" />

const { student, teacher, admin } = require('../fixtures/headers')

describe('Responsible Teachers', () => {
  beforeEach(() => {
    cy.createFeedbackTarget({ extraStudents: 5 })
    cy.setFeedbackActive()

    const today = new Date()
    const interimFeedbackBody = {
      name: {
        fi: 'Testi välipalaute',
        en: 'Test interim feedback',
        sv: '',
      },
      startDate: today,
      endDate: new Date().setDate(today.getDate() + 7),
    }

    cy.getTestFbtId().as('parentId')

    cy.get('@parentId').then(parentId => cy.createInterimFeedback(parentId, interimFeedbackBody))

    // Login as Tommi Testaaja
    cy.loginAs(teacher)
  })

  it('can fill in new interim feedbacks', () => {
    cy.visit(`/courses`)

    // Visit the coursepage where teacher is the responsible teacher
    cy.get('[data-cy="my-teaching-course-unit-item-TEST_COURSE"').should('exist')
    cy.get('@parentId').then(parentId => {
      cy.get(`[data-cy="my-teaching-feedback-target-item-link-${parentId}"]`).should('exist').click()
    })

    // Assert that the interim feedbacks tab is rendered
    cy.get('[data-cy="feedback-target-interim-feedback-tab"]').should('exist').click()
    cy.get('[data-cy="interim-feedbacks-no-surveys-alert"]').should('not.exist')
    cy.get('[data-cy="interim-feedbacks-add-new"]').should('exist').click()

    // Assert that the editor is rendered correctly
    cy.get('[data-cy="interim-feedback-editor-title"]').should('exist')
    cy.get('[data-cy="interim-feedback-editor-save"]').should('exist')
    cy.get('[data-cy="interim-feedback-editor-cancel"]').should('exist')

    // Fill in the name of the survey
    cy.get('[data-cy="formik-locales-field-fi-name"]').type('Uusi välipalaute')
    cy.get('[data-cy="formik-locales-field-sv-name"]').type('New interim feedback')
    cy.get('[data-cy="formik-locales-field-en-name"]').type('New interim feedback')

    // Assert that the startDate picker is there
    cy.get('[data-cy="formik-date-picker-field-startDate"]').should('be.visible')

    // Assert that the endDate picker is there
    cy.get('[data-cy="formik-date-picker-field-endDate"]').should('be.visible')

    cy.get('[data-cy="interim-feedback-editor-save"]').click()

    // Visit the interim feedbacks
    cy.get('@parentId').then(parentId => {
      cy.visit(`/targets/${parentId}/interim-feedback`)
    })

    cy.get('@interimFeedback').then(interimFeedback => {
      // Assert that the feedback was created correctly
      cy.get(`[data-cy="interim-feedback-item-title-${interimFeedback.id}"]`).should('exist')
      cy.get(`[data-cy="interim-feedback-not-open-${interimFeedback.id}"]`).should('not.exist')
      cy.get(`[data-cy="interim-feedback-open-${interimFeedback.id}"]`).should('exist')
      cy.get(`[data-cy="interim-feedback-period-info-${interimFeedback.id}"]`).should('exist')
      cy.get(`[data-cy="interim-feedback-feedback-count-${interimFeedback.id}"]`).should('exist')
      cy.get(`[data-cy="interim-feedback-feedback-count-percentage-${interimFeedback.id}"]`)
        .should('exist')
        .contains('0/6')

      cy.get(`[data-cy="interim-feedback-responsible-persons-${interimFeedback.id}"]`)
        .should('exist')
        .children('.MuiChip-root')
        .should('have.length', 1)
        .should('contain', 'Tommi Testaaja')

      cy.get(`[data-cy="interim-feedback-show-feedback-${interimFeedback.id}"]`).should('exist')
      cy.get(`[data-cy="interim-feedback-show-results-${interimFeedback.id}"]`).should('not.exist')
      cy.get(`[data-cy="interim-feedback-delete-${interimFeedback.id}"]`).should('exist')
    })
  })

  it('can view my teaching interim feedbacks if responsible teacher', () => {
    cy.visit(`/courses`)

    // Visit the coursepage where teacher is the responsible teacher
    cy.get('[data-cy="my-teaching-course-unit-item-TEST_COURSE"').should('exist')
    cy.get('@parentId').then(parentId => {
      cy.get(`[data-cy="my-teaching-feedback-target-item-link-${parentId}"]`).should('exist').click()
    })

    // Assert that the interim feedbacks tab is rendered
    cy.get('[data-cy="feedback-target-interim-feedback-tab"]').should('exist').click()
    cy.get('[data-cy="interim-feedbacks-no-surveys-alert"]').should('not.exist')

    cy.get('@interimFeedback').then(interimFeedback => {
      // Assert that the feedback was created correctly
      cy.get(`[data-cy="interim-feedback-item-title-${interimFeedback.id}"]`).should('exist')
      cy.get(`[data-cy="interim-feedback-not-open-${interimFeedback.id}"]`).should('not.exist')
      cy.get(`[data-cy="interim-feedback-open-${interimFeedback.id}"]`).should('exist')
      cy.get(`[data-cy="interim-feedback-period-info-${interimFeedback.id}"]`).should('exist')
      cy.get(`[data-cy="interim-feedback-feedback-count-${interimFeedback.id}"]`).should('exist')
      cy.get(`[data-cy="interim-feedback-feedback-count-percentage-${interimFeedback.id}"]`)
        .should('exist')
        .contains('0/6')

      cy.get(`[data-cy="interim-feedback-responsible-persons-${interimFeedback.id}"]`)
        .should('exist')
        .children('.MuiChip-root')
        .should('have.length', 1)
        .should('contain', 'Tommi Testaaja')

      cy.get(`[data-cy="interim-feedback-show-feedback-${interimFeedback.id}"]`).should('exist')
      cy.get(`[data-cy="interim-feedback-show-results-${interimFeedback.id}"]`).should('not.exist')
      cy.get(`[data-cy="interim-feedback-delete-${interimFeedback.id}"]`).should('exist')

      // Visit the interim feedbacks feedback page
      cy.get(`[data-cy="interim-feedback-show-feedback-${interimFeedback.id}"]`).click()
    })

    cy.url().should('include', '/feedback')

    // Assert that the feedback information is rendered correctly
    cy.get('[data-cy="interim-feedback-target-primary-course-name"]').should('exist')
    cy.get('[data-cy="interim-feedback-target-secondary-course-name"]').should('exist')
    cy.get('[data-cy="interim-feedback-target-feedback-dates"]').should('exist')
    cy.get('[data-cy="feedback-target-edit-interim-feedback"]').should('exist')
    cy.get('[data-cy="interim-feedback-target-feedback-count"]').should('exist')

    // Assert no initial student feedbacks
    cy.get('[data-cy="interim-feedback-target-feedback-count-percentage"]').should('exist').contains('0/6')

    // Assert correct teacher list is rendered
    cy.get('[data-cy="interim-feedback-target-responsible-administrative-person-list"]').should('not.exist')
    cy.get('[data-cy="interim-feedback-target-responsible-teacher-list"]').should('exist')
    cy.get('[data-cy="interim-feedback-target-teacher-list"]').should('not.exist')

    // Assert that the links are rendered correctly
    cy.get('[data-cy="interim-feedback-target-copy-student-link"]').should('exist')
    cy.get('[data-cy="interim-feedback-target-organisation-link"]').should('not.exist')
    cy.get('[data-cy="interim-feedback-target-course-summary-link"]').should('not.exist')
    cy.get('[data-cy="interim-feedback-target-course-page-link"]').should('not.exist')
    cy.get('[data-cy="interim-feedback-target-wiki-link"]').should('exist')
    cy.get('[data-cy="interim-feedback-target-sisu-page-link"]').should('not.exist')
    cy.get('[data-cy="interim-feedback-target-interim-feedback-parent-link"]').should('exist')

    // Assert that the tabs are rendered correctly
    cy.get('[data-cy="interim-feedback-target-give-feedback-tab"]').should('exist').click()
    cy.get('[aria-label="Survey can no longer be edited after the feedback has opened"]').should('exist')
    cy.get('[data-cy="interim-feedback-target-share-feedback-tab"]').should('exist').click()
    cy.get('[data-cy="interim-feedback-target-results-tab"]').should('exist').click()
    cy.get('[data-cy="interim-feedback-target-students-with-feedback-tab"]').should('exist').click()
  })

  it('can edit interim feedbacks', () => {
    cy.get('@parentId').then(parentId => {
      cy.visit(`/targets/${parentId}/interim-feedback`)
    })

    cy.get('@interimFeedback').then(interimFeedback => {
      // Assert that the feedback was created correctly
      cy.get(`[data-cy="interim-feedback-item-title-${interimFeedback.id}"]`).should('exist')
      cy.get(`[data-cy="interim-feedback-not-open-${interimFeedback.id}"]`).should('not.exist')
      cy.get(`[data-cy="interim-feedback-open-${interimFeedback.id}"]`).should('exist')
      cy.get(`[data-cy="interim-feedback-period-info-${interimFeedback.id}"]`).should('exist')
      cy.get(`[data-cy="interim-feedback-feedback-count-${interimFeedback.id}"]`).should('exist')
      cy.get(`[data-cy="interim-feedback-feedback-count-percentage-${interimFeedback.id}"]`)
        .should('exist')
        .contains('0/6')

      cy.get(`[data-cy="interim-feedback-responsible-persons-${interimFeedback.id}"]`)
        .should('exist')
        .children('.MuiChip-root')
        .should('have.length', 1)
        .should('contain', 'Tommi Testaaja')

      cy.get(`[data-cy="interim-feedback-show-feedback-${interimFeedback.id}"]`).should('exist')
      cy.get(`[data-cy="interim-feedback-show-results-${interimFeedback.id}"]`).should('not.exist')
      cy.get(`[data-cy="interim-feedback-delete-${interimFeedback.id}"]`).should('exist')

      // Visit the interim feedbacks feedback page
      cy.get(`[data-cy="interim-feedback-show-feedback-${interimFeedback.id}"]`).click()
      cy.get('[data-cy="feedback-target-edit-interim-feedback"]').should('exist').click()
    })

    // Change the interim feedbacks name fields
    cy.get('[data-cy="formik-locales-field-fi-name"]').clear().type('New interim feedback')
    cy.get('[data-cy="formik-locales-field-sv-name"]').clear().type('New interim feedback')
    cy.get('[data-cy="formik-locales-field-en-name"]').clear().type('New interim feedback')

    // Save the changes
    cy.get('[data-cy="interim-feedback-editor-save"]').should('exist').click()

    cy.get('[data-cy="interim-feedback-modal-close-button"]').should('exist').click()

    cy.get('@interimFeedback').then(interimFeedback => {
      // Assert that the feedback was updated correctly
      cy.get(`[data-cy="interim-feedback-item-title-${interimFeedback.id}"]`).contains('New interim feedback')

      // Only the name changed so these should have remained the same
      cy.get(`[data-cy="interim-feedback-not-open-${interimFeedback.id}"]`).should('not.exist')
      cy.get(`[data-cy="interim-feedback-open-${interimFeedback.id}"]`).should('exist')
      cy.get(`[data-cy="interim-feedback-period-info-${interimFeedback.id}"]`).should('exist')
      cy.get(`[data-cy="interim-feedback-feedback-count-${interimFeedback.id}"]`).should('exist')
      cy.get(`[data-cy="interim-feedback-feedback-count-percentage-${interimFeedback.id}"]`)
        .should('exist')
        .contains('0/6')

      cy.get(`[data-cy="interim-feedback-responsible-persons-${interimFeedback.id}"]`)
        .should('exist')
        .children('.MuiChip-root')
        .should('have.length', 1)
        .should('contain', 'Tommi Testaaja')

      cy.get(`[data-cy="interim-feedback-show-feedback-${interimFeedback.id}"]`).should('exist')
      cy.get(`[data-cy="interim-feedback-show-results-${interimFeedback.id}"]`).should('not.exist')
      cy.get(`[data-cy="interim-feedback-delete-${interimFeedback.id}"]`).should('exist')

      // Assert that the interim feedback may be deleted if no feedbacks are given
      cy.on('window:confirm', str => {
        expect(str).to.be.oneOf([
          'Are you sure you want to remove this interim feedback?',
          'Haluatko varmasti poistaa tämän välipalautteen?',
        ])
      })

      cy.get(`[data-cy="interim-feedback-delete-${interimFeedback.id}"]`).should('exist').click()

      // Assert that the feedback was created correctly
      cy.get(`[data-cy="interim-feedback-item-title-${interimFeedback.id}"]`).should('not.exist')
    })

    cy.get('[data-cy="interim-feedbacks-no-surveys-alert"]').should('exist')
  })

  it('can not create/edit questions for ongoing interim feedback', () => {
    cy.get('@parentId').then(parentId => {
      cy.visit(`/targets/${parentId}/interim-feedback`)
    })

    cy.get('@interimFeedback').then(interimFeedback => {
      cy.get(`[data-cy="interim-feedback-show-feedback-${interimFeedback.id}"]`).click()
    })

    // Assert that the edit tab is disabled
    cy.get('[aria-label="Survey can no longer be edited after the feedback has opened"]').should('exist')
    cy.get('[data-cy="interim-feedback-target-settings-tab"]').should('have.attr', 'aria-disabled', 'true')
  })

  it('can create questions for interim feedbacks', () => {
    const today = new Date()
    const interimFeedbackBody = {
      name: {
        fi: 'Uusin välipalaute',
        en: 'Newest interim feedback',
        sv: '',
      },
      startDate: new Date().setDate(today.getDate() + 1),
      endDate: new Date().setDate(today.getDate() + 7),
    }
    cy.getTestFbtId().as('parentId')
    cy.get('@parentId').then(parentId => cy.createInterimFeedback(parentId, interimFeedbackBody))

    cy.get('@interimFeedback').then(interimFeedback => {
      cy.visit(`/targets/${interimFeedback.id}`)
    })

    cy.get('[data-cy="interim-feedback-target-settings-tab"]').should('exist').click()

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
    cy.createFeedbackTarget({ extraStudents: 5 })
    const today = new Date()
    const interimFeedbackBody = {
      name: {
        fi: 'Testi välipalaute',
        en: 'Test interim feedback',
        sv: '',
      },
      startDate: today,
      endDate: new Date().setDate(today.getDate() + 7),
    }
    cy.getTestFbtId().as('parentId')
    cy.get('@parentId').then(parentId => cy.createInterimFeedback(parentId, interimFeedbackBody))

    // Login as Olli Oppilas
    cy.loginAs(student)
  })

  it('can view ongoing interim feedbacks and give interim feedback', () => {
    cy.visit(`/feedbacks`)

    cy.get('@interimFeedback').then(interimFeedback => {
      cy.get(`[data-cy="feedback-item-${interimFeedback.id}"]`).should('exist').click()
    })

    cy.get('[data-cy="feedback-item-give-feedback"]').should('exist').click()

    // Assert students does not see the edit button
    cy.get('[data-cy="feedback-target-edit-interim-feedback"]').should('not.exist')

    cy.get('[data-cy="interim-feedback-target-give-feedback-tab"]').should('exist').click()
    cy.get('[data-cy="interim-feedback-target-results-tab"]').should('not.exist')

    // Give the feedback
    cy.get('[data-cy=feedback-view-give-feedback]').click()
    cy.contains('Feedback has been given. Thank you for your feedback!')

    // New tabs are rendered when feedback was given
    cy.get('[data-cy="interim-feedback-target-edit-feedback-tab"]').should('exist')
    cy.get('[data-cy="interim-feedback-target-results-tab"]').should('exist').click()
    cy.contains('Multiple choice questions')

    cy.url().should('include', '/results')

    // Edit answer
    cy.get('[data-cy="interim-feedback-target-edit-feedback-tab"]').click()
    cy.get('[data-cy=feedback-view-give-feedback]').click()
    cy.contains('Feedback has been given. Thank you for your feedback!')
    cy.url().should('include', '/results')

    // Assert that the feedback page got updated
    cy.visit(`/feedbacks`)

    cy.get('@interimFeedback').then(interimFeedback => {
      // Awaiting tab check
      cy.get('[data-cy="my-feedbacks-waiting-tab"]').should('exist').click()
      cy.get(`[data-cy="feedback-item-${interimFeedback.id}"]`).should('not.exist')
      cy.get('[data-cy="my-feedbacks-no-feedbacks"]').should('exist')

      // Given tab check
      cy.get('[data-cy="my-feedbacks-given-tab"]').should('exist').click()
      cy.get(`[data-cy="feedback-item-${interimFeedback.id}"]`).should('exist')
      cy.get('[data-cy="my-feedbacks-no-feedbacks"]').should('not.exist')
    })
  })
})

describe('Admin Users', () => {
  beforeEach(() => {
    cy.createFeedbackTarget({ extraStudents: 5 })
    const today = new Date()
    const interimFeedbackBody = {
      name: {
        fi: 'Testi välipalaute',
        en: 'Test interim feedback',
        sv: '',
      },
      startDate: today,
      endDate: new Date().setDate(today.getDate() + 7),
    }

    cy.getTestFbtId().as('parentId')

    cy.get('@parentId').then(parentId => cy.createInterimFeedback(parentId, interimFeedbackBody))

    cy.loginAs(admin)
  })

  it('can create questions for interim feedbacks regardles of ongoing feedback', () => {
    cy.get('@interimFeedback').then(interimFeedback => {
      cy.visit(`/targets/${interimFeedback.id}`)
    })

    cy.get('[data-cy="interim-feedback-target-settings-tab"]').should('exist').click()

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

  it('can delete interim feedbacks after feedback has been given', () => {
    cy.giveInterimFeedback(student)

    cy.get('@parentId').then(parentId => {
      cy.visit(`/targets/${parentId}/interim-feedback`)
    })

    cy.get('[data-cy="interim-feedbacks-no-surveys-alert"]').should('not.exist')

    cy.on('window:confirm', str => {
      expect(str).to.be.oneOf([
        'Are you sure you want to remove this interim feedback?',
        'Haluatko varmasti poistaa tämän välipalautteen?',
      ])
    })

    cy.get('@interimFeedback').then(interimFeedback => {
      // Assert that the feedback is rendered correctly and feedback was given
      cy.get(`[data-cy="interim-feedback-item-title-${interimFeedback.id}"]`).should('exist')
      cy.get(`[data-cy="interim-feedback-open-${interimFeedback.id}"]`).should('exist')
      cy.get(`[data-cy="interim-feedback-period-info-${interimFeedback.id}"]`).should('exist')
      cy.get(`[data-cy="interim-feedback-feedback-count-${interimFeedback.id}"]`).should('exist')
      cy.get(`[data-cy="interim-feedback-feedback-count-percentage-${interimFeedback.id}"]`)
        .should('exist')
        .contains('1/6')

      cy.get(`[data-cy="interim-feedback-responsible-persons-${interimFeedback.id}"]`)
        .should('exist')
        .children('.MuiChip-root')
        .should('have.length', 1)
        .should('contain', 'Tommi Testaaja')

      // Remove the interim feedback
      cy.get(`[data-cy="interim-feedback-delete-${interimFeedback.id}"]`).should('exist').click()
      // Assert that the feedback was created correctly
      cy.get(`[data-cy="interim-feedback-item-title-${interimFeedback.id}"]`).should('not.exist')
    })

    cy.get('[data-cy="interim-feedbacks-no-surveys-alert"]').should('be.visible')
  })
})
