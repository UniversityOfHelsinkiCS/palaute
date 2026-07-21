/// <reference types="cypress" />

const { student } = require('../fixtures/headers')

function logViolations(violations) {
  cy.task('log', `Number of detected accessibility violations: ${violations.length}`)

  const violationData = violations.map(v => {
    const { nodes, ...dataToLog } = v
    const affectedNodeCount = nodes.length
    return { ...dataToLog, affectedNodeCount }
  })
  cy.task('log', violationData)
}

describe('In accessibility testing', () => {
  beforeEach(() => {
    cy.createFeedbackTarget({ extraStudents: 5 })
    cy.setFeedbackActive()
    cy.getTestFbtId().as('fbtId')
    cy.loginAs(student)
    cy.get('@fbtId').then((/** @type {number} */ id) => cy.visit(`/targets/${id}`))
    cy.injectAxe()
  })
  it('Empty feedback form does not have accessibility issues', () => {
    cy.contains(
      'Your name will not be shown to the teacher with your feedback. Fields marked with an asterisk (*) are required.'
    )
    cy.checkA11y(null, null, logViolations)
  })
})
