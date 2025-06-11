import { teacher, student } from '../fixtures/headers'

describe('When course has only one enrolled student', () => {
  beforeEach(() => {
    cy.createFeedbackTarget({})
    cy.setFeedbackActive()
    cy.getTestFbtId().as('fbtId')
  })

  describe('After logging in and navigating to My feedback page', () => {
    beforeEach(() => {
      cy.loginAs(student)
      cy.get('[data-cy="navbar-link-My feedback"]').click()
    })

    it('Student gets a warning about small course when opening the feedback form', () => {
      cy.get('[data-cy=feedback-item-give-feedback-small-course]').click()
      cy.contains('Attention!')
    })

    it('Student can close small course warning', () => {
      cy.get('[data-cy="navbar-link-My feedback"]').click()
      cy.get('[data-cy=feedback-item-give-feedback-small-course]').click()
      cy.get('[data-cy=confirm-giving-feedback-dialog-close]').click()
      cy.contains('Attention!').should('not.exist')
      cy.get('[data-cy=feedback-item-give-feedback-small-course]').should('exist')
    })

    it('Student can open feedback form after reading the warning', () => {
      cy.get('[data-cy="navbar-link-My feedback"]').click()
      cy.get('[data-cy=feedback-item-give-feedback-small-course]').click()
      cy.get('[data-cy=confirm-giving-feedback-dialog-give-feedback]').click()
      cy.contains('Attention!').should('not.exist')
      cy.contains('Testikysymys 1 *')
    })
  })

  describe('After answering feedback questions', () => {
    beforeEach(() => {
      cy.loginAs(student)
      cy.get('@fbtId').then(id => cy.visit(`/targets/${id}`))
      cy.get('input[value=5]').each($el => {
        cy.wrap($el).click()
      })
      cy.getUniversityQuestions().then(questions => {
        const openQuestion = questions.find(q => q.type === 'OPEN')
        cy.get(`textarea[id=${openQuestion.id}-label]`).type('Other comments and such')
      })
    })

    it('Give feedback button should only be enabled when consent box is checked', () => {
      cy.get('[data-cy=feedback-view-give-feedback]').should('be.disabled')
      cy.get('[data-cy=feedback-view-consent-checkbox]').click()
      cy.get('[data-cy=feedback-view-consent-checkbox]').should('have.class', 'Mui-checked')
      cy.get('[data-cy=feedback-view-give-feedback]').should('be.enabled')
      cy.get('[data-cy=feedback-view-consent-checkbox]').click()
      cy.get('[data-cy=feedback-view-consent-checkbox]').should('not.have.class', 'Mui-checked')
      cy.get('[data-cy=feedback-view-give-feedback]').should('be.disabled')
    })

    it('Feedback can be submitted after checking the consent box', () => {
      cy.get('[data-cy=feedback-view-consent-checkbox]').click()
      cy.get('[data-cy=feedback-view-give-feedback]').click()
      cy.contains('Feedback has been given. Thank you for your feedback!')
    })

    describe('After submitting feedback', () => {
      beforeEach(() => {
        cy.get('[data-cy=feedback-view-consent-checkbox]').click()
        cy.get('[data-cy=feedback-view-give-feedback]').click()
      })

      it('Student should not see feedback results', () => {
        cy.contains(
          'To protect the anonymity of feedback, survey results are not shown when there are fewer than 5 enrolled students. ' +
            'The teacher can see the feedback if the student has given their consent.'
        )
        cy.contains('Multiple choice questions').should('not.exist')
      })

      it('Teacher should see feedback results', () => {
        cy.loginAs(teacher)
        cy.get('@fbtId').then(id => cy.visit(`/targets/${id}/results`))
        cy.contains('Multiple choice questions')
        cy.contains('Testikysymys 1')
      })
    })
  })
})
