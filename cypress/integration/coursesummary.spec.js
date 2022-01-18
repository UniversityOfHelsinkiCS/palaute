describe('Course summary view', () => {
  it('An user with organisation access can visit summary page', () => {
    cy.loginAsStudyCoordinator()
    cy.contains('Course summary').click()
    cy.wait(10000)
    cy.contains('Summary of course feedback')
    cy.contains(`Bachelor's Programme in Theology and Religious Studies`)
  })

  it('An user with write access can edit programme level questions', () => {
    cy.loginAsStudyCoordinator()
    cy.contains('Course summary').click()
    cy.wait(10000)

    cy.get('a[id=settings-button-500-K005]').click()
    cy.contains(`Bachelor's Programme in Computer Science`)

    cy.contains('Programme survey').click()

    cy.contains('Add question').click()
    cy.get('li').contains('Textual content').click()

    cy.get('textarea[id^=textual-context-text-en-questions]').type(
      'Test question programme level',
    )

    cy.get('[data-cy=saveQuestion]').click()
    cy.contains('Save').click()

    cy.wait(1000)

    cy.contains('[data-cy=programmeQuestionsDialogConfirm]', 'Edit').click()

    cy.visit('localhost:8000/targets/165/feedback')

    cy.contains('Test question programme level')
  })
})
