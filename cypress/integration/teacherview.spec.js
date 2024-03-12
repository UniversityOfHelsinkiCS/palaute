/// <reference types="Cypress" />

import { student, teacher } from '../fixtures/headers'

describe('Teacher view', () => {
  beforeEach(() => {
    cy.createFeedbackTarget({ extraStudents: 5 })

    cy.getTestFbtId().as('fbtId')

    cy.loginAs(teacher)
  })

  it('A logged in teacher can view its courses', () => {
    cy.visit(`/courses`)

    cy.get('[id="my-teaching-title"]').contains('My surveys')

    // Checks that the tabs are rendered correctly
    cy.get('[data-cy=my-teaching-active-tab]').contains('Active surveys').should('exist').click()
    cy.get('[data-cy="my-teaching-no-courses"]').should('exist')

    cy.get('[data-cy=my-teaching-upcoming-tab]').contains('Upcoming surveys').should('exist').click()
    cy.get('[data-cy="my-teaching-no-courses"]').should('exist')

    cy.get('[data-cy=my-teaching-ended-tab]').contains('Ended surveys').should('exist').click()
    cy.get('[data-cy="my-teaching-no-courses"]').should('not.exist')

    cy.get('[data-cy="course-unit-group-title-Course surveys"]')
      .should('exist')
      .children()
      .should('have.length', 1)
      .should('have.attr', 'aria-label', '1 Survey')

    cy.get('[data-cy="course-unit-group-title-Organisation surveys"').should('not.exist')
    cy.get('[data-cy="course-unit-group-expand-more"').should('not.exist')

    cy.get('[data-cy=my-teaching-course-unit-accordion-TEST_COURSE]').should('exist').click()

    cy.get('@fbtId').then(id => {
      cy.get(`[data-cy="my-teaching-feedback-target-period-info-${id}"]`).should('exist')
      cy.get(`[data-cy="my-teaching-feedback-target-item-link-${id}"]`).should('exist')
      cy.get(`a[href*="/targets/${id}"]`).first().click()
    })
  })

  it('A logged in teacher can give counter feedback for an ended course', () => {
    cy.setFeedbackClosed()

    cy.visit(`/courses`)
    cy.get('[data-cy=my-teaching-ended-tab]').contains('Ended surveys').should('exist').click()

    cy.get('[data-cy=my-teaching-course-unit-accordion-TEST_COURSE]').click()

    cy.get('@fbtId').then(id => cy.visit(`/targets/${id}/edit-feedback-response`))

    cy.get('textarea').first().type('Counter feedback for students to see')
    cy.get('[data-cy=openFeedbackResponseSubmitDialog]').click()
    cy.get('[data-cy=saveFeedbackResponse]').click()

    cy.visit(`/courses`)
    cy.get('[data-cy=my-teaching-ended-tab]').contains('Ended surveys').click()

    cy.contains('TEST_COURSE').click()
    cy.get('@fbtId').then(id => cy.get(`[data-cy=feedbackResponseGiven-${id}-true]`))
  })

  it('Teacher can add questions to a survey', () => {
    cy.get('@fbtId').then(id => cy.visit(`/targets/${id}/edit`))
    cy.contains('Add question').click()
    cy.get('li').contains('Scale of values').click()
    cy.get('input[id^=likert-question-en-questions]').type('Test question')
    cy.get('input[id^=likert-description-en-questions]').type('Test description')

    cy.get('[data-cy=question-card-save-edit]').click()
    cy.reload()
    cy.contains('Test question')
    cy.contains('Test description')
  })

  it('Teacher can edit a question', () => {
    cy.get('@fbtId').then(id => cy.visit(`/targets/${id}/edit`))
    cy.contains('Add question').click()
    cy.get('li').contains('Scale of values').click()
    cy.get('input[id^=likert-question-en-questions]').type('Test question')
    cy.get('input[id^=likert-description-en-questions]').type('Test description')
    cy.get('[data-cy=question-card-save-edit]').click()
    cy.reload()

    cy.get('[data-cy=editQuestion]').first().click()
    cy.get('input[id^=likert-question-en-questions]').type(' edited')
    cy.get('input[id^=likert-description-en-questions]').type(' edited')
    cy.get('[data-cy=question-card-save-edit]').click()
    cy.reload()
    cy.contains('Test question edited')
    cy.contains('Test description edited')
  })

  it('Teacher can view survey results', () => {
    cy.setFeedbackActive()
    cy.giveFeedback(student)
    cy.visit(`/courses`)
    cy.get('div').contains('TEST_COURSE').click()
    cy.get('@fbtId').then(id => cy.get(`a[href*="/targets/${id}"]`).first().click())
    cy.get('@fbtId').then(id => cy.visit(`/targets/${id}/results`))
    cy.contains('Feedback').click()
    cy.contains('Multiple choice questions')
  })
})
