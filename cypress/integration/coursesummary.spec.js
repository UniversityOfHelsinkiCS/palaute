const { baseUrl } = require('../support')

describe('Course summary view', () => {
  beforeEach(() => {
    cy.loginAsStudyCoordinator()
  })

  it('User with organisation access can visit summary page', () => {
    cy.visit(`${baseUrl}/course-summary/old`)
    cy.contains('Summary of course feedback')
    cy.contains(`Bachelor's Programme in Theology and Religious Studies`)
  })

  it('User can navigate to programme from summary', () => {
    cy.visit(`${baseUrl}/course-summary/old`)
    cy.wait(1000)
    cy.get('a[id=settings-button-500-K005]').click()
    cy.contains(`Bachelor's Programme in Computer Science`)
    cy.contains('Programme survey').click()
  })

  describe('Programme survey', () => {
    beforeEach(() => {
      cy.visit(`${baseUrl}/organisations/500-K005/survey`)
      cy.on('window:confirm', str => {
        expect(str).to.eq(
          'You are editing the questions shared by the whole programme. These questions are visible for all the courses of the programme. Are you sure you want to edit these questions?'
        )
      })
    })

    it('User with write access can ADD programme level questions', () => {
      cy.contains('Add textual content').click()

      cy.get('textarea[id^=textual-context-text-en-questions]').type('Test question programme level')

      cy.get('[data-cy=question-card-save-edit]').click()

      cy.wait(500)

      cy.visit(`${baseUrl}/organisations/500-K005/survey`)
      cy.contains('Test question programme level')
    })

    it('New programme level question appears in feedback target survey', () => {
      cy.visit(`${baseUrl}/targets/165`)
      cy.contains('Test question programme level')
    })

    it('User with write access can EDIT programme level questions', () => {
      cy.get('[data-cy=editQuestion]').first().click()

      cy.get('textarea[id^=textual-context-text-en-questions]').type(' edited question')

      cy.get('[data-cy=question-card-save-edit]').click()

      cy.wait(500)

      cy.visit(`${baseUrl}/organisations/500-K005/survey`)

      cy.contains('edited question')
    })

    it('Edited programme level question appears in feedback target survey', () => {
      cy.visit(`${baseUrl}/targets/165`)
      cy.contains('edited question')
    })

    it('New likert question appears in programmesummary', () => {
      cy.contains('Add question').click()

      cy.get('li').contains('Scale of values').click()

      cy.get('input[id^=likert-question-en-questions]').type('LIKERT TEST')

      cy.get('[data-cy=question-card-save-edit]').click()

      cy.wait(500)

      cy.visit(`${baseUrl}/organisations/500-K005/summary`)
      cy.contains('LIKERT TEST')
    })
  })
})
