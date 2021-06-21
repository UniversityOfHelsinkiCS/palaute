describe('User feedbacks view', function () {
  it('A feedback is visible after teacher has set it active', function () {
    cy.loginAsSecondaryTeacher()
    cy.setFeedbackActive()
    cy.loginAsStudent()
    cy.contains('Functional Programming I')
    cy.contains('Give feedback')
  })
  it('Student can give feedback to an active course', function () {
    cy.loginAsStudent()
    cy.contains('Give feedback').click()
    cy.contains(
      'This feedback is anonymous. Fields marked with an asterisk (*) are required',
    )
    cy.contains('Give feedback')
  })
})
