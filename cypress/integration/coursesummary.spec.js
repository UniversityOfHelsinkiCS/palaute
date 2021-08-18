describe('Course summary view', () => {
  it('An user with organisation access can visit summary page', () => {
    cy.loginAsStudyCoordinator()
    cy.contains('Course summary').click()
    cy.contains('Summary of course feedback')
    cy.contains(`Bachelor's Programme in Theology and Religious Studies`)
  })

  it('An user with write access can edit programme level questions', () => {
    cy.loginAsStudyCoordinator()
    cy.contains('Course summary').click()
    cy.get('a[id=settings-button-500-K005]').click()
    cy.contains(`Bachelor's Programme in Computer Science`)

    cy.contains('Programme survey').click()

    cy.contains('Add question').click()
    cy.contains('Single choice question').click()

    cy.get('input[id^=choice-question-en-questions]').type(
      'Test question programme level',
    )

    cy.get('input[id^=choice-description-en-questions]').type(
      'Test description programme level',
    )

    cy.contains('Done').click()

    cy.visit('localhost:8000/targets/165/feedback')

    cy.contains('Test question programme level')
  })
})
