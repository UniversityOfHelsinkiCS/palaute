/// <reference types="cypress" />

const { teacher, student } = require('../fixtures/headers')

describe('Continuous feedback', () => {
  beforeEach(() => {
    cy.createFeedbackTarget()

    cy.loginAs(teacher)
  })
  it('Teacher can enable continuous feedback, student can then give it, teacher can then respond to it and student can see the response', () => {
    // Teacher enables continuous feedback
    cy.visit(`/courses`)

    cy.get('[data-cy=my-teaching-ended-tab]').click()

    cy.get('[data-cy=my-teaching-course-unit-accordion-TEST_COURSE]').should('exist').click()

    cy.get('@feedbackTarget').then(([fbt]) => {
      cy.get(`[data-cy="my-teaching-feedback-target-item-link-${fbt.id}"]`).should('exist').click()
    })

    cy.get('[data-cy="feedback-target-continuous-feedback-tab"]').click()

    cy.get('[data-cy=activateContinuousFeedback]').click()

    cy.contains('Information has been saved')

    // Student gives continuous feedback
    cy.loginAs(student)
    cy.visit(``)

    cy.get('[data-cy=my-feedbacks-continuous-tab]').click()
    cy.get('[data-cy=giveContinuousFeedback]').click()

    cy.get('textarea').first().type('Giving continuous feedback')

    cy.contains('Send feedback').click()

    cy.contains('Feedback has been sent succesfully')
    cy.contains('Giving continuous feedback')

    // Teacher replies to continuous feedback
    cy.loginAs(teacher)
    cy.visit(`/courses`)

    cy.get('[data-cy=my-teaching-ended-tab]').click()

    cy.get('[data-cy=my-teaching-course-unit-accordion-TEST_COURSE]').should('exist').click()

    cy.get('@feedbackTarget').then(([fbt]) => {
      cy.get(`[data-cy="my-teaching-feedback-target-item-link-${fbt.id}"]`).should('exist').click()
    })

    cy.get('[data-cy="feedback-target-continuous-feedback-tab"]').click()

    cy.contains('Giving continuous feedback')

    cy.get('[data-cy=respondContinuousFeedback]').click()
    cy.get('textarea').first().type('Responding to continuous feedback')
    cy.get('[data-cy=sendContinuousFeedbackResponse]').click()

    cy.contains('Response sent succesfully')
    cy.contains('Responding to continuous feedback')

    // Student sees continuous feedback response
    cy.loginAs(student)
    cy.visit(``)

    cy.get('[data-cy=my-feedbacks-continuous-tab]').click()
    cy.get('[data-cy=giveContinuousFeedback]').click()
    cy.get('[data-cy=feedback-target-continuous-feedback-tab]').click()

    cy.contains('Responding to continuous feedback')
  })
})
