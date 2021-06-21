describe('Course summary view', function () {
  it('An user with organisation access can visit summary page', function () {
    cy.loginAsStudyCoordinator()
    cy.contains('Course summary').click()
    cy.contains('Summary of course feedback')
    cy.contains(`Bachelor's Programme in Theology and Religious Studies`)
  }),
    it('An user with write access can edit programme level questions', function () {
      cy.loginAsStudyCoordinator()
      cy.contains('Course summary').click()
      cy.get('a[id=settings-button-500-K005]').click()
      cy.contains(
        'Programme survey and settings can be edited by programme personel',
      )
      cy.contains('Student list visible')

      cy.contains('English').click()
      cy.contains('Add question').click()
      cy.contains('Single choice question').click()
      cy.get('input[id^=choice-question-questions]').type(
        'Test question programme level',
      )
      cy.get('input[id^=choice-description-questions]').type(
        'Test description programme level',
      )
      cy.contains('Done').click()
      cy.visit('localhost:8000/targets/165/feedback')
      cy.contains('Test question programme level')
    })
})
