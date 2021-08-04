describe('User feedbacks view', () => {
  /* it('A feedback is visible after teacher has set it active', () => {
    cy.loginAsSecondaryTeacher()
    cy.setFeedbackActive()
    cy.loginAsStudent()
    cy.contains('Functional Programming I')
    cy.contains('Give feedback')
  }) */
  /* it('Student can give feedback to an active course', () => {
    cy.loginAsStudent()
    cy.contains('Give feedback').click()
    cy.contains(
      'This feedback is anonymous. Fields marked with an asterisk (*) are required',
    )
    cy.get('input[value=1]').each(($el) => {
      cy.get($el).click()
    })
    cy.get('textarea[id=19-label]').type('Other comments and such')
    cy.get('div').contains('Give feedback').click()
    cy.contains(
      'Thank you for the feedback, here is a summary of the feedbacks so far.',
    )
    cy.get('table').contains('The course was laborious')
  }) */
  /* it('Student can clear given feedback', () => {
    cy.loginAsStudent()
    cy.contains('Given').click()
    cy.contains('Clear feedback').click()
    cy.contains('Yes').click()
    cy.contains('Waiting').click()
    cy.contains('Functional Programming I')
  }) */
})
