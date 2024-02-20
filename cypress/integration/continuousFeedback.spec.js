/// <reference types="Cypress" />

const { addDays } = require('date-fns')
const { admin, teacher, student } = require('../fixtures/headers')
const { baseUrl } = require('../support')

describe('Continuous feedback', () => {
  beforeEach(() => {
    cy.request({
      method: 'POST',
      url: 'api/test/seed-feedback-targets',
      body: { teacher, student, opensAt: addDays(new Date(), 1), closesAt: addDays(new Date(), 2) },
      headers: admin,
    })
  })

  afterEach(() => {
    cy.request({
      method: 'POST',
      url: 'api/test/clear-feedback-targets',
      body: { teacher, student },
      headers: admin,
    })
  })

  it('Teacher can enable continuous feedback, student can then give it, teacher can then respond to it and student can see the response', () => {
    // Teacher enables continuous feedback
    cy.loginAs(teacher)
    cy.visit(`${baseUrl}/courses`)
    cy.contains('SUMMARY_TEST_COURSE').first().click()
    cy.contains('Testauskurssin toteutus').first().click()
    cy.get('[data-cy="feedback-target-continuous-feedback-tab"]').click()

    cy.get('[data-cy=activateContinuousFeedback]').click()

    cy.contains('Information has been saved')

    // Student gives continuous feedback
    cy.loginAs(student)
    cy.visit(`${baseUrl}`)

    cy.get('[data-cy=my-feedbacks-continuous-tab]').click()
    cy.get('[data-cy=giveContinuousFeedback]').click()

    cy.get('textarea').first().type('Giving continuous feedback')

    cy.contains('Send feedback').click()

    cy.contains('Feedback has been sent succesfully')
    cy.contains('Giving continuous feedback')

    // Teacher replies to continuous feedback
    const response = 'Responding to continuous feedback'
    cy.loginAs(teacher)
    cy.visit(`${baseUrl}/courses`)
    cy.contains('SUMMARY_TEST_COURSE').first().click()
    cy.contains('Testauskurssin toteutus').first().click()
    cy.get('[data-cy="feedback-target-continuous-feedback-tab"]').click()

    cy.contains('Giving continuous feedback')

    cy.get('[data-cy=respondContinuousFeedback]').click()
    cy.get('textarea').first().type(response)
    cy.get('[data-cy=sendContinuousFeedbackResponse]').click()

    cy.contains('Response sent succesfully')
    cy.contains(response)

    // Student sees continuous feedback response
    cy.loginAs(student)
    cy.visit(`${baseUrl}`)

    cy.get('[data-cy=my-feedbacks-continuous-tab]').click()
    cy.get('[data-cy=giveContinuousFeedback]').click()
    cy.get('[data-cy=feedback-target-continuous-feedback-tab]').click()

    cy.contains(response)
  })
})
