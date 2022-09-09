import { format } from 'date-fns'
import { baseUrl } from '../support'

// eslint-disable-next-line no-unused-vars
const getDates = () => {
  const date = new Date()

  const startDate = format(new Date().setDate(date.getDate() - 1), 'dd.MM.yyyy')
  const endDate = format(
    new Date().setHours(date.getHours() - 10),
    'dd.MM.yyyy',
  )

  return { startDate, endDate }
}

describe('Teacher view', () => {
  beforeEach(() => {
    cy.loginAsTeacher()
  })
  it('A logged in teacher can view its courses', () => {
    cy.visit(`${baseUrl}/courses`)
    cy.contains('My teaching')
    cy.contains('Ongoing courses (0)')
    cy.contains('Upcoming courses (0)')
    cy.contains('Ended courses')
  })
  it('A logged in teacher can view its ended courses', () => {
    cy.visit(`${baseUrl}/courses`)
    cy.contains('My teaching')
    cy.contains('TKT20002 Software Development Methods')
    cy.get('div').contains('TKT20002 Software Development Methods').click()
    const { startDate, endDate } = getDates()
    cy.contains(`${startDate} - ${endDate}`)
  })
  it('A logged in teacher can give counter feedback for an ended course', () => {
    cy.visit(`${baseUrl}/courses`)
    cy.get('[data-cy=courseUnitAccordion-TKT20002]').click()

    cy.visit(`${baseUrl}/targets/97/edit-feedback-response`)

    cy.get('textarea').first().type('Counter feedback for students to see')
    cy.get('[data-cy=openFeedbackResponseSubmitDialog]').click()
    cy.get('[data-cy=saveFeedbackResponse]').click()
    cy.visit(`${baseUrl}/courses`)
    cy.contains('TKT20002').click()
    cy.get('[data-cy=feedbackResponseGiven-97-true]')
  })
  it('Teacher can add questions to a survey', () => {
    cy.visit(`${baseUrl}/targets/165/edit`)
    cy.contains('Add question').click()
    cy.get('li').contains('Scale of values').click()
    cy.get('input[id^=likert-question-en-questions]').type('Test question')

    cy.get('input[id^=likert-description-en-questions]').type(
      'Test description',
    )

    cy.get('[data-cy=saveQuestion]').click()
  })
  it('Teacher can view survey results', () => {
    cy.loginAsSecondaryTeacher()
    cy.get('div').contains('TKT21029 Functional Programming I').click()
    cy.get('a[href*="/targets/163"]').first().click()
    cy.visit(`${baseUrl}/targets/163/results`)
    cy.contains('Feedback').click()
    cy.contains(
      'Survey results will not be displayed because it does not have enough feedback',
    )
  })
})
