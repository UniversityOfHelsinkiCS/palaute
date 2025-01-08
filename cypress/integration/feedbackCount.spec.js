const { teacher, student } = require('../fixtures/headers')

/// <reference types="Cypress" />


describe('Feedback count', () => {
  beforeEach(() => {
    cy.createFeedbackTarget({ extraStudents: 5 })
    cy.setFeedbackActive()
    cy.getTestFbtId().as('fbtId')
  })

  it('Feedback count increases on feedback page when a student gives feedback', () => {
    // Initial feedback count
    cy.loginAs(teacher)
    cy.get('@fbtId').then(id => cy.visit(`/targets/${id}`))
    cy.get('[data-cy=feedback-target-feedback-count-percentage]').invoke('text').then(text => {
      cy.wrap(text).as('initialCount')
    })

    // Student gives feedback
    cy.loginAs(student)
    cy.get('[data-cy="navbar-link-My feedback"]').click()
    cy.get('[data-cy=feedback-item-give-feedback]').click()
    cy.contains('This feedback is anonymous. Fields marked with an asterisk (*) are required')
    cy.get('input[value=5]').each($el => {
      cy.get($el).click()
    })
    cy.getUniversityQuestions().then(questions => {
      const openQuestion = questions.find(q => q.type === 'OPEN')
      cy.get(`textarea[id=${openQuestion.id}-label]`).type('Other comments and such')
    })
    cy.get('[data-cy=feedback-view-give-feedback]').click()
    cy.contains('Feedback has been given. Thank you for your feedback!')

    // Verify feedback count increased
    cy.loginAs(teacher)
    cy.get('@fbtId').then(id => cy.visit(`/targets/${id}`))
    cy.get('[data-cy=feedback-target-feedback-count-percentage]').invoke('text').then(newCount => {
      cy.get('@initialCount').then(initialCount => {
        const newCountInt = parseInt(newCount.split("/")[0], 10)
        console.log(newCountInt)
        const initialCountInt = parseInt(initialCount.split("/")[0], 10)
        console.log(initialCountInt)
        expect(newCountInt).to.eq(initialCountInt + 1)
      })
    })
  })
})