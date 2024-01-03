const { baseUrl } = require('../support')

describe('Responsible Teachers', () => {
  beforeEach(() => {
    cy.clearInterimFeedbacks()

    const today = new Date()
    const parentId = '163'
    const interimFeedbackBody = {
      name: {
        fi: 'Testi välipalaute',
        en: 'Test interim feedback',
        sv: '',
      },
      startDate: today,
      endDate: new Date().setDate(today.getDate() + 7),
    }

    cy.wrap(parentId).as('parentId')

    cy.createInterimFeedback(parentId, interimFeedbackBody)

    // Login as Tommi Testaaja
    cy.loginAsSecondaryTeacher()
  })

  it('can fill in new interim feedbacks', () => {
    cy.visit(`${baseUrl}/courses`)

    // Visit the coursepage where teacher is the responsible teacher
    cy.get('[data-cy="my-teaching-course-unit-accordion-TKT21029"').should('exist').click()
    cy.get('[data-cy="my-teaching-feedback-target-item-link-Functional Programming I"]').should('exist').click()

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

    // Assert that the feedback was created correctly
    cy.get('[data-cy="interim-feedback-item-title-New interim feedback"]').should('exist')
    cy.get('[data-cy="interim-feedback-not-open-New interim feedback"]').should('exist')
    cy.get('[data-cy="interim-feedback-period-info-New interim feedback"]').should('exist')
    cy.get('[data-cy="interim-feedback-feedback-count-New interim feedback"]').should('exist')
    cy.get('[data-cy="interim-feedback-feedback-count-percentage-0/7"]').should('exist')
    cy.get('[data-cy="interim-feedback-responsible-persons-New interim feedback"]').should('exist')
    cy.get('[data-cy="interim-feedback-responsible-persons-New interim feedback-chips-Tommi Testaaja"]').should('exist')

    cy.get('[data-cy="interim-feedback-show-feedback-New interim feedback"]').should('exist')
    cy.get('[data-cy="interim-feedback-show-results-New interim feedback"]').should('not.exist')
    cy.get('[data-cy="interim-feedback-delete-New interim feedback"]').should('exist')
  })

  it('can view courses interim feedbacks if responsible teacher', () => {
    cy.visit(`${baseUrl}/courses`)

    // Visit the coursepage where teacher is the responsible teacher
    cy.get('[data-cy="my-teaching-course-unit-accordion-TKT21029"').should('exist').click()
    cy.get('[data-cy="my-teaching-feedback-target-item-link-Functional Programming I"]').should('exist').click()

    // Assert that the interim feedbacks tab is rendered
    cy.get('[data-cy="feedback-target-interim-feedback-tab"]').should('exist').click()
    cy.get('[data-cy="interim-feedbacks-no-surveys-alert"]').should('not.exist')

    // Assert that the feedback was created correctly
    cy.get('[data-cy="interim-feedback-item-title-Test interim feedback"]').should('exist')
    cy.get('[data-cy="interim-feedback-open-Test interim feedback"]').should('exist')
    cy.get('[data-cy="interim-feedback-not-open-Test interim feedback"]').should('not.exist')
    cy.get('[data-cy="interim-feedback-period-info-Test interim feedback"]').should('exist')
    cy.get('[data-cy="interim-feedback-feedback-count-Test interim feedback"]').should('exist')
    cy.get('[data-cy="interim-feedback-feedback-count-percentage-0/7"]').should('exist')
    cy.get('[data-cy="interim-feedback-responsible-persons-Test interim feedback"]').should('exist')
    cy.get('[data-cy="interim-feedback-responsible-persons-Test interim feedback-chips-Tommi Testaaja"]').should(
      'exist'
    )

    cy.get('[data-cy="interim-feedback-show-feedback-Test interim feedback"]').should('exist')
    cy.get('[data-cy="interim-feedback-show-results-Test interim feedback"]').should('not.exist')
    cy.get('[data-cy="interim-feedback-delete-Test interim feedback"]').should('exist')

    // Visit the interim feedbacks feedback page
    cy.get('[data-cy="interim-feedback-show-feedback-Test interim feedback"]').click()

    cy.url().should('include', '/feedback')

    // Assert that the feedback information is rendered correctly
    cy.get('[data-cy="interim-feedback-target-primary-course-name"]').should('exist')
    cy.get('[data-cy="interim-feedback-target-secondary-course-name"]').should('exist')
    cy.get('[data-cy="interim-feedback-target-feedback-dates"]').should('exist')
    cy.get('[data-cy="feedback-target-edit-interim-feedback"]').should('exist')
    cy.get('[data-cy="interim-feedback-target-feedback-count"]').should('exist')

    // Assert no initial student feedbacks
    cy.get('[data-cy="interim-feedback-target-feedback-count-percentage-0/7"]').should('exist')

    // Assert correct teacher list is rendered
    cy.get('[data-cy="interim-feedback-target-responsible-administrative-person-list"]').should('not.exist')
    cy.get('[data-cy="interim-feedback-target-responsible-teacher-list"]').should('exist')
    cy.get('[data-cy="interim-feedback-target-teacher-list"]').should('exist')

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
      cy.visit(`${baseUrl}/targets/${parentId}/interim-feedback`)
    })

    // Assert that the feedback was created correctly
    cy.get('[data-cy="interim-feedback-item-title-Test interim feedback"]').should('exist')
    cy.get('[data-cy="interim-feedback-open-Test interim feedback"]').should('exist')
    cy.get('[data-cy="interim-feedback-not-open-Test interim feedback"]').should('not.exist')
    cy.get('[data-cy="interim-feedback-period-info-Test interim feedback"]').should('exist')
    cy.get('[data-cy="interim-feedback-feedback-count-Test interim feedback"]').should('exist')
    cy.get('[data-cy="interim-feedback-feedback-count-percentage-0/7"]').should('exist')
    cy.get('[data-cy="interim-feedback-responsible-persons-Test interim feedback"]').should('exist')
    cy.get('[data-cy="interim-feedback-responsible-persons-Test interim feedback-chips-Tommi Testaaja"]').should(
      'exist'
    )

    // Go to the edit modal of the interim feedback
    cy.get('[data-cy="interim-feedback-show-feedback-Test interim feedback"]').click()
    cy.get('[data-cy="feedback-target-edit-interim-feedback"]').should('exist').click()

    // Change the interim feedbacks name fields
    cy.get('[data-cy="formik-locales-field-fi-name"]').clear().type('Uusi välipalaute')
    cy.get('[data-cy="formik-locales-field-sv-name"]').clear().type('New interim feedback')
    cy.get('[data-cy="formik-locales-field-en-name"]').clear().type('New interim feedback')

    // Save the changes
    cy.get('[data-cy="interim-feedback-editor-save"]').should('exist').click()

    cy.get('[data-cy="interim-feedback-modal-close-button"]').should('exist').click()

    // Assert that the feedback was created correctly
    cy.get('[data-cy="interim-feedback-item-title-New interim feedback"]').should('exist')
    cy.get('[data-cy="interim-feedback-open-New interim feedback"]').should('exist')
    cy.get('[data-cy="interim-feedback-not-open-New interim feedback"]').should('not.exist')
    cy.get('[data-cy="interim-feedback-period-info-New interim feedback"]').should('exist')
    cy.get('[data-cy="interim-feedback-feedback-count-New interim feedback"]').should('exist')
    cy.get('[data-cy="interim-feedback-feedback-count-percentage-0/7"]').should('exist')
    cy.get('[data-cy="interim-feedback-responsible-persons-New interim feedback"]').should('exist')
    cy.get('[data-cy="interim-feedback-responsible-persons-New interim feedback-chips-Tommi Testaaja"]').should('exist')

    // Assert that the interim feedback may be deleted if no feedbacks are given
    cy.on('window:confirm', str => {
      expect(str).to.eq('Are you sure you want to remove this interim feedback?')
    })

    cy.get('[data-cy="interim-feedback-delete-New interim feedback"]').should('exist').click()
    // Assert that the feedback was created correctly
    cy.get('[data-cy="interim-feedback-item-title-New interim feedback"]').should('not.exist')
  })

  it.only('can not create/edit questions for ongoing interim feedback', () => {
    cy.get('@parentId').then(parentId => {
      cy.visit(`${baseUrl}/targets/${parentId}/interim-feedback`)
    })

    cy.get('[data-cy="interim-feedback-show-feedback-Test interim feedback"]').click()

    cy.get('[aria-label="Survey can no longer be edited after the feedback has opened"]').should('exist')
    cy.get('[data-cy="interim-feedback-target-settings-tab"]').should('have.attr', 'aria-disabled', 'true')
  })

  it('can create questions for interim feedbacks', () => {})
})

describe('Students', () => {
  beforeEach(() => {})

  it('can view ongoing interim feedbacks and give interim feedback', () => {})
})

describe('Admin Users', () => {
  beforeEach(() => {})

  it('can create questions for interim feedbacks regardles of ongoing feedback', () => {})

  it('can delete interim feedbacks after feedback has been given', () => {})
})
