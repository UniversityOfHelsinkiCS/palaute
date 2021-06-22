import { format } from 'date-fns'

const getDates = () => {
  const date = new Date()

  const startDate = format(
    new Date().setMonth(date.getMonth() - 2),
    'dd.MM.yyyy',
  )
  const endDate = format(new Date().setMonth(date.getMonth() - 1), 'dd.MM.yyyy')

  return { startDate, endDate }
}

describe('Teacher view', function () {
  beforeEach(function () {
    cy.loginAsTeacher()
  })
  it('A logged in teacher can view its courses', function () {
    cy.setUpTeacherview()
    cy.contains('My teaching')
    cy.contains('Ongoing courses (0)')
    cy.contains('Upcoming courses (0)')
    cy.contains('Ended courses')
  })
  it('A logged in teacher can view its ended courses', function () {
    cy.contains('My teaching')
    cy.contains('TKT20002 Software Development Methods')
    cy.get('div').contains('TKT20002 Software Development Methods').click()
    const { startDate, endDate } = getDates()
    cy.contains(`${startDate} - ${endDate}`)
  })
  it('If feedback response has not been given teacher is notified', function () {
    cy.get('p')
      .contains('TKT20002 Software Development Methods')
      .parent()
      .contains('Counter feedback missing')
  })
  it('If teacher has ongoing courses their surveys can be edited', function () {
    cy.loginAsSecondaryTeacher()
    cy.contains('Ongoing courses (2)')
    cy.get('div').contains('TKT21024 Programming Challenges I').click()
    cy.contains('0/2 feedbacks given')
    cy.get('button[id^=settings-icon]').click()
    cy.contains('Edit survey').click()
    cy.contains('Programming Challenges I')
    cy.contains('Add question')
  })
  it('Teacher can add questions to a survey', function () {
    cy.visit('localhost:8000/targets/165/edit')
    cy.contains('Add question').click()
    cy.get('li').contains('Scale of values').click()
    cy.get('input[id^=likert-question-questions]').type('Test question')
    cy.get('input[id^=likert-description-questions]').type('Test description')
    cy.get('button').contains('Done').click()
  })
  it('Teacher can view survey results', function () {
    cy.loginAsSecondaryTeacher()
    cy.get('div').contains('TKT21029 Functional Programming I').click()
    cy.get('button[id^=settings-icon]').click()
    cy.contains('Show feedbacks').click()
    cy.contains(
      'Survey results will not be displayed because it does not have enough feedbacks',
    )
  })
})
