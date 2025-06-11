const { teacher, student } = require('../fixtures/headers')

/// <reference types="cypress" />

describe('Feedback results', () => {
  beforeEach(() => {
    cy.createFeedbackTarget({ extraStudents: 12 })
    cy.setFeedbackActive()
    cy.getTestFbtId().as('fbtId')
  })

  it('Feedback count increases everywhere when a student gives feedback', () => {
    cy.loginAs(teacher)
    // Initial feedback count on my teaching page
    cy.visit('/courses')
    cy.get('@fbtId')
      .then(id => cy.get(`[data-cy="my-teaching-feedback-target-secondary-text-${id}"]`))
      .invoke('text')
      .then(text => {
        cy.wrap(text).as('myTeachingInitialCount')
      })

    // Initial feedback count on feedback page
    cy.get('@fbtId').then(id => cy.visit(`/targets/${id}`))
    cy.get('[data-cy=feedback-target-feedback-count-percentage]')
      .invoke('text')
      .then(text => {
        cy.wrap(text).as('fbtPageInitialCount')
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

    // Verify feedback count increased on feedback page
    cy.loginAs(teacher)
    cy.get('@fbtId').then(id => cy.visit(`/targets/${id}`))
    cy.get('[data-cy=feedback-target-feedback-count-percentage]')
      .invoke('text')
      .then(newCount => {
        cy.get('@fbtPageInitialCount').then(initialCount => {
          const newCountInt = parseInt(newCount.split('/')[0], 10)
          const initialCountInt = parseInt(initialCount.split('/')[0], 10)
          expect(newCountInt).to.eq(initialCountInt + 1)
        })
      })

    // Verify feedback count increased on my teaching page
    cy.visit('/courses')
    cy.get('@fbtId')
      .then(id => cy.get(`[data-cy="my-teaching-feedback-target-secondary-text-${id}"]`))
      .invoke('text')
      .then(newCount => {
        cy.get('@myTeachingInitialCount').then(initialCount => {
          const newCountInt = parseInt(newCount.split('/')[0], 10)
          const initialCountInt = parseInt(initialCount.split('/')[0], 10)
          expect(newCountInt).to.eq(initialCountInt + 1)
        })
      })
  })
})
