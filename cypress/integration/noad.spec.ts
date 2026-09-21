import { subDays } from 'date-fns'

import { admin, student } from '../fixtures/headers'

const visitStudentTokenLink = (fbtId: number) => {
  cy.visit(`/targets/${fbtId}/togen`)
  // Get the token link text
  cy.get(`[data-cy=noad-token-${student.studentNumber}]`).then($el => {
    const tokenLinkText = $el.text()
    cy.visit(tokenLinkText)
  })
}

describe('Noad user', () => {
  beforeEach(() => {
    cy.createFeedbackTarget({ extraStudents: 5 })
    cy.setFeedbackActive()
    cy.getTestFbtId().as('fbtId')
    cy.loginAs(admin)
    cy.get<number>('@fbtId').then(fbtId => {
      visitStudentTokenLink(fbtId)
    })
  })

  it('should see feedback target and be able to navigate to it', () => {
    cy.contains('My feedback')
    cy.contains('TEST_COURSE')

    cy.get('[data-cy=give-feedback-link]').click()

    cy.get('input[value=5]').each($el => {
      cy.wrap($el).check()
    })
    cy.getUniversityQuestions().then(questions => {
      const openQuestion = questions.find(q => q.type === 'OPEN')!
      cy.get(`textarea[id=${openQuestion.id}-input]`).type('Other comments and such')
    })
    cy.get('[data-cy=feedback-view-give-feedback]').click()
    cy.contains('Thank you for the feedback')
  })
})

describe('Noad user with an expired link', () => {
  // The token expires NOAD_LINK_EXPIRATION_DAYS (14) days after the feedback target closes,
  // so a target that closed long enough ago yields an already expired token.
  beforeEach(() => {
    cy.createFeedbackTarget({
      opensAt: subDays(new Date(), 60),
      closesAt: subDays(new Date(), 40),
    })
    cy.getTestFbtId().as('fbtId')
    cy.loginAs(admin)
    cy.get<number>('@fbtId').then(fbtId => {
      visitStudentTokenLink(fbtId)
    })
  })

  it('should not be logged in, and should be told so instead of seeing an error', () => {
    cy.contains('you are currently not logged in', { timeout: 20000 })
    cy.contains('My feedback').should('not.exist')
  })
})
