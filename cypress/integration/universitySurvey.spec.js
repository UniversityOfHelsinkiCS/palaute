import { admin } from '../fixtures/headers'

describe('University Survey', () => {
  beforeEach(() => {
    cy.loginAs(admin)
    cy.createFeedbackTarget({ extraStudents: 5 })
    cy.setFeedbackActive()
    cy.getTestFbtId().as('fbtId')
  })

  it('Can be edited, and affects feedback form', () => {
    const questionTitle = 'How minttu was the course?'

    // Initially, the new university question is not visible
    cy.get('@fbtId').then(fbtId => cy.visit(`/targets/${fbtId}/feedback`))
    cy.contains(questionTitle).should('not.exist')

    // Go to the admin edit page and add a new university question
    cy.visit('/admin/misc')
    cy.contains('Edit university survey').click()
    cy.get('[data-cy=question-editor-add-question]').click()
    cy.get('[data-cy=question-editor-type-menu-select-likert]').click()
    // Text field id is likert-question-fi-questions.n
    cy.get('[id^=likert-question-fi-questions]').last().type(questionTitle)
    cy.get('[data-cy=question-card-save-edit]').click()

    // Go back to the feedback form and check that the new question is now visible
    cy.get('@fbtId').then(fbtId => cy.visit(`/targets/${fbtId}/feedback`))
    cy.contains(questionTitle)
  })
})
