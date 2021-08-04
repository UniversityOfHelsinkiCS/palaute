import { format } from 'date-fns'

// eslint-disable-next-line no-unused-vars
const getDates = () => {
  const date = new Date()

  const startDate = format(
    new Date().setMonth(date.getMonth() - 2),
    'dd.MM.yyyy',
  )
  const endDate = format(new Date().setMonth(date.getMonth() - 1), 'dd.MM.yyyy')

  return { startDate, endDate }
}

describe('Teacher view', () => {
  beforeEach(() => {
    cy.loginAsTeacher()
  })
  it('A logged in teacher can view its courses', () => {
    cy.setUpAdminTeacherView()
    cy.contains('My teaching')
    cy.contains('Ongoing courses (0)')
    cy.contains('Upcoming courses (0)')
    cy.contains('Ended courses')
  })
  /* it('A logged in teacher can view its ended courses', () => {
    cy.contains('My teaching')
    cy.contains('TKT20002 Software Development Methods')
    cy.get('div').contains('TKT20002 Software Development Methods').click()
    const { startDate, endDate } = getDates()
    cy.contains(`${startDate} - ${endDate}`)
  }) */
  /* it('A logged in teacher can give feedback response for an ended course', () => {
    cy.get('p')
      .contains('TKT20002 Software Development Methods')
      .parent()
      .contains('Feedback summary missing')
    cy.get('div').contains('TKT20002 Software Development Methods').click()
    cy.get('a[href*="/targets/97"]').click()
    cy.contains('Feedbacks').click()
    cy.contains('Give feedback summary').click()
    cy.get('textarea').type('Feedback response for students to see')
    cy.contains('Save').click()
    cy.contains('Norppa').click()
    cy.contains('TKT20002 Software Development Methods').click()
    cy.contains('Feedback summary given')
  }) */
  /* it('A teacher can edit feedback response once given', () => {
    cy.contains('TKT20002 Software Development Methods').click()
    cy.get('a[href*="/targets/97"]').click()
    cy.contains('Feedbacks').click()
    cy.contains('Edit feedback summary').click()
    cy.get('textarea').clear()
    cy.get('textarea').type('Edited feedback response for students to see')
    cy.contains('Save').click()
    cy.contains('Norppa').click()
    cy.contains('TKT20002 Software Development Methods').click()
    cy.get('a[href*="/targets/97"]').click()
    cy.contains('Feedbacks').click()
    cy.contains('Edited feedback response for students to see')
  }) */
  /* it('If teacher has ongoing courses their surveys can be edited', () => {
    cy.loginAsSecondaryTeacher()
    cy.setUpSecondaryTeacherView()
    cy.contains('Ongoing courses')
    cy.get('div').contains('TKT21024 Programming Challenges I').click()
    cy.contains('0/2 feedbacks given')
    cy.get('a[href*="/targets/165"]').click()
    cy.contains('Edit survey').click()
    cy.contains('Programming Challenges I')
    cy.contains('Add question')
  }) */
  it('Teacher can add questions to a survey', () => {
    cy.visit('localhost:8000/targets/165/edit')
    cy.contains('Add question').click()
    cy.get('li').contains('Scale of values').click()
    cy.get('input[id^=likert-question-questions]').type('Test question')
    cy.get('input[id^=likert-description-questions]').type('Test description')
    cy.get('button').contains('Done').click()
  })
  it('Teacher can view survey results', () => {
    /* cy.loginAsSecondaryTeacher()
    cy.get('div').contains('TKT21029 Functional Programming I').click()
    cy.get('a[href*="/targets/163"]').click() */
    cy.visit('localhost:8000/targets/163/results')
    cy.contains('Feedbacks').click()
    cy.contains(
      'Survey results will not be displayed because it does not have enough feedbacks',
    )
  })
})
