const { baseUrl } = require('../support')

describe('User feedbacks view', () => {
  it('A feedback is visible after teacher has set it active', () => {
    // setup
    cy.loginAsSecondaryTeacher()
    cy.setFeedbackActive()
    cy.loginAsStudent()

    cy.contains('Functional Programming I')
    cy.get('[data-cy=giveCourseFeedback]').click()
    cy.contains(
      'This feedback is anonymous. Fields marked with an asterisk (*) are required',
    )
    cy.get('input[value=1]').each(($el) => {
      cy.get($el).click()
    })
    cy.get('textarea[id=19-label]').type('Other comments and such')
    cy.get('[data-cy=submitFeedbackButton]').click()
    cy.contains('Feedback has been given. Thank you for your feedback!')
  })
  it('Teacher can censor a feedback', () => {
    cy.loginAsSecondaryTeacher()
    cy.visit(`${baseUrl}/targets/163/results`)
    cy.get('[data-testid="VisibilityIcon"]').click()
    cy.contains('This answer is hidden')

    // it is now hidden from student
    cy.loginAsStudent()
    cy.visit(`${baseUrl}/targets/163/results`)
    cy.contains('Other comments and such').should('not.exist')
  })
  it('Student can clear given feedback', () => {
    // setup
    cy.loginAsSecondaryTeacher()
    cy.setFeedbackActive()
    cy.loginAsStudent()

    cy.loginAsStudent()
    cy.contains('Given').click()
    cy.contains('Remove my feedback').click()
    cy.contains('Yes').click()
    cy.contains('Awaiting').click()
    cy.contains('Functional Programming I')
  })
})
