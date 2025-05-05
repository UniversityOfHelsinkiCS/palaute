import { admin, student } from '../fixtures/headers'

describe('Noad user', () => {
  beforeEach(() => {
    cy.createFeedbackTarget({ extraStudents: 5 })
    cy.setFeedbackActive()
    cy.getTestFbtId().as('fbtId')
    cy.loginAs(admin)
    cy.get('@fbtId').then(fbtId => {
      cy.visit(`/targets/${fbtId}/togen`)
      // Get the token link text
      cy.get(`[data-cy=noad-token-${student.studentNumber}]`).then($el => {
        const tokenLinkText = $el.text()
        cy.visit(tokenLinkText)
      })
    })
  })

  it('should see feedback target and be able to navigate to it', () => {
    cy.contains('My feedback')
    cy.contains('TEST_COURSE')

    cy.get('[data-cy=give-feedback-link]').click()

    cy.get('input[value=5]').each($el => {
      cy.wrap($el).check()
    })
    cy.getUniversityQuestions().then(questions => {
      const openQuestion = questions.find(q => q.type === 'OPEN')
      cy.get(`textarea[id=${openQuestion.id}-label]`).type('Other comments and such')
    })
    cy.get('[data-cy=feedback-view-give-feedback]').click()
    cy.contains('Thank you for the feedback')
  })
})
