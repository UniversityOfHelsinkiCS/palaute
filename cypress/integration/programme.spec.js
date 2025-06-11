/// <reference types="cypress" />

const { organisationCorrespondent } = require('../fixtures/headers')

describe('Organisation settings', () => {
  beforeEach(() => {
    cy.createFeedbackTarget()
    cy.seedTestOrgCorrespondent(organisationCorrespondent)
    cy.loginAs(organisationCorrespondent)
  })

  describe('Programme survey', () => {
    beforeEach(() => {
      cy.visit(`/organisations/TEST_ORG/survey`)
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

      cy.visit(`/organisations/TEST_ORG/survey`)
      cy.contains('Test question programme level')
    })

    it('User with write access can EDIT programme level questions', () => {
      cy.contains('Add textual content').click()
      cy.get('textarea[id^=textual-context-text-en-questions]').type('Test question programme level')
      cy.get('[data-cy=question-card-save-edit]').click()
      cy.reload()

      cy.get('[data-cy=editQuestion]').first().click()
      cy.get('textarea[id^=textual-context-text-en-questions]').type(' edited question')
      cy.get('[data-cy=question-card-save-edit]').click()
      cy.visit(`/organisations/TEST_ORG/survey`)
      cy.contains('edited question')
    })

    it('Edited programme level question appears in feedback target survey', () => {
      cy.contains('Add textual content').click()
      cy.get('textarea[id^=textual-context-text-en-questions]').type('Test question programme level')
      cy.get('[data-cy=question-card-save-edit]').click()

      cy.getTestFbtId().then(id => cy.visit(`/targets/${id}`))
      cy.contains('Test question programme level')

      cy.visit(`/organisations/TEST_ORG/survey`)
      cy.get('[data-cy=editQuestion]').first().click()
      cy.get('textarea[id^=textual-context-text-en-questions]').type(' edited question')
      cy.get('[data-cy=question-card-save-edit]').click()
      cy.visit(`/organisations/TEST_ORG/survey`)
      cy.contains('edited question')

      cy.getTestFbtId().then(id => cy.visit(`/targets/${id}`))
      cy.contains('edited question')
    })

    it('New likert question appears in programmesummary', () => {
      cy.contains('Add question').click()
      cy.get('li').contains('Scale of values').click()
      cy.get('input[id^=likert-question-en-questions]').type('LIKERT TEST')
      cy.get('[data-cy=question-card-save-edit]').click()

      cy.visit(`/organisations/TEST_ORG/summary`)
      cy.contains('LIKERT TEST')
    })
  })
})
