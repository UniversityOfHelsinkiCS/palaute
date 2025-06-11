/// <reference types="cypress" />

const { teacher, student } = require('../fixtures/headers')

describe('User feedbacks view', () => {
  beforeEach(() => {
    cy.createFeedbackTarget({ extraStudents: 5 })
    cy.setFeedbackActive()
    cy.getTestFbtId().as('fbtId')
  })
  it('A feedback is visible after teacher has set it active', () => {
    // student gives feedback
    cy.loginAs(student)

    // Check that the notification badge is visible in the navbar
    cy.get('[data-cy="navbar-link-My feedback"]')
      .should('exist')
      .children('[data-cy="navbar-notification-badge"]')
      .should('exist')

    // Give feedback
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

    // Notification badge should be gone now that feedback has been given
    cy.get('[data-cy="navbar-link-My feedback"]')
      .should('exist')
      .children('[data-cy="navbar-notification-badge"]')
      .should('not.exist')
  })

  it('Feedback is visible immediately after being given', () => {
    cy.loginAs(student)
    cy.get('@fbtId').then(id => cy.visit(`/targets/${id}`))
    cy.get('input[value=5]').each($el => {
      cy.get($el).click()
    })
    cy.getUniversityQuestions().then(questions => {
      const openQuestion = questions.find(q => q.type === 'OPEN')
      cy.get(`textarea[id=${openQuestion.id}-label]`).type('Other comments and such')
    })
    cy.get('[data-cy=feedback-view-give-feedback]').click()

    cy.get('[data-cy="feedback-target-results-tab"]')

    cy.contains('Multiple choice questions')
  })

  it('Teacher can censor a feedback', () => {
    // student gives feedback
    cy.loginAs(student)
    cy.get('@fbtId').then(id => cy.visit(`/targets/${id}`))
    cy.get('input[value=5]').each($el => {
      cy.get($el).click()
    })
    cy.getUniversityQuestions().then(questions => {
      const openQuestion = questions.find(q => q.type === 'OPEN')
      cy.get(`textarea[id=${openQuestion.id}-label]`).type('Other comments and such')
    })
    cy.get('[data-cy=feedback-view-give-feedback]').click()

    // teacher censors the feedback
    cy.loginAs(teacher)
    cy.get('@fbtId').then(id => cy.visit(`/targets/${id}/results`))
    cy.scrollTo('bottom', { ensureScrollable: false })
    cy.get('[data-testid="VisibilityIcon"]').click()
    cy.contains('This answer is hidden')

    // it is now hidden from student
    cy.loginAs(student)
    cy.get('@fbtId').then(id => cy.visit(`/targets/${id}/results`))
    cy.contains('Other comments and such').should('not.exist')
  })

  it('Student can clear given feedback', () => {
    cy.loginAs(student)

    // Check that the notification badge is visible in the navbar
    cy.get('[data-cy="navbar-link-My feedback"]')
      .should('exist')
      .children('[data-cy="navbar-notification-badge"]')
      .should('exist')

    // student gives feedback
    cy.get('@fbtId').then(id => cy.visit(`/targets/${id}`))
    cy.get('input[value=5]').each($el => {
      cy.get($el).click()
    })
    cy.getUniversityQuestions().then(questions => {
      const openQuestion = questions.find(q => q.type === 'OPEN')
      cy.get(`textarea[id=${openQuestion.id}-label]`).type('Other comments and such')
    })
    cy.get('[data-cy=feedback-view-give-feedback]').click()

    // Notification badge should be gone now that feedback has been given
    cy.get('[data-cy="navbar-link-My feedback"]')
      .should('exist')
      .children('[data-cy="navbar-notification-badge"]')
      .should('not.exist')

    // student clears the feedback
    cy.visit(``)
    cy.contains('Given').click()
    cy.contains('Remove my feedback').click()
    cy.contains('Yes').click()
    cy.contains('Awaiting').click()
    cy.get('[data-cy=feedback-item-give-feedback]').should('exist')

    // Notification badge should be back now that feedback has been cleared
    cy.get('[data-cy="navbar-link-My feedback"]')
      .should('exist')
      .children('[data-cy="navbar-notification-badge"]')
      .should('exist')
  })
})
