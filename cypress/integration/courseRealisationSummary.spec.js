describe('Course realisation summaries', () => {
  it('User can navigate to course realisation summaries', () => {
    cy.loginAsStudyCoordinator()
    cy.contains('Course summary').click()
    cy.contains(
      `Bachelor's Programme in Theology and Religious Studies`,
    ).click()
    cy.contains('Introduction to theology and religious studies').click()
    cy.contains('Course realisation')
  })
})
