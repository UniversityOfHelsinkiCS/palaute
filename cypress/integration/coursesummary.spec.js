const { baseUrl } = require('../support')

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

    cy.on('window:confirm', (str) => {
      expect(str).to.eq(
        'You are editing the questions shared by the whole programme. These questions are visible for all the courses of the programme. Are you sure you want to edit these questions?',
      )
    })

    cy.contains('Add question').click()
    cy.get('li').contains('Textual content').click({ force: true })

    cy.get('textarea[id^=textual-context-text-en-questions]').type(
      'Test question programme level',
    )

    cy.get('[data-cy=saveQuestion]').click()

    cy.wait(1000)

    cy.visit(`${baseUrl}/organisations/500-K005/survey`)

    cy.contains('Test question programme level')
  })
})
