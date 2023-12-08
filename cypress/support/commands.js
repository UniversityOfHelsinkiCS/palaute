import { baseUrl } from './baseUrl'
import {
  admin,
  teacher,
  student,
  studentHenri,
  studentMiko,
  studentVeikko,
  studentRandom,
  studyCoordinator,
  organisationCorrespondent,
} from '../fixtures/headers'

Cypress.Commands.add('loginAsTeacher', () => {
  localStorage.setItem('fakeUser', JSON.stringify(admin))

  cy.visit(baseUrl)
})

Cypress.Commands.add('loginAsAdmin', () => {
  localStorage.setItem('fakeUser', JSON.stringify(admin))

  cy.visit(baseUrl)
})

Cypress.Commands.add('loginAsSecondaryTeacher', () => {
  localStorage.setItem('fakeUser', JSON.stringify(teacher))

  cy.visit(baseUrl)
})

Cypress.Commands.add('loginAsStudent', studentName => {
  let logInAsStudent

  // Select the correct student header based on the provided student name
  switch (studentName.toLowerCase()) {
    case 'henri':
      logInAsStudent = studentHenri
      break
    case 'miko':
      logInAsStudent = studentMiko
      break
    case 'veikko':
      logInAsStudent = studentVeikko
      break
    case 'random':
      logInAsStudent = studentRandom
      break
    default:
      logInAsStudent = student
  }

  localStorage.setItem('fakeUser', JSON.stringify(logInAsStudent))

  cy.visit(baseUrl)
})

Cypress.Commands.add('loginAsStudyCoordinator', () => {
  localStorage.setItem('fakeUser', JSON.stringify(studyCoordinator))
  cy.visit(baseUrl)
})

Cypress.Commands.add('loginAsOrganisationCorrespondent', () => {
  localStorage.setItem('fakeUser', JSON.stringify(organisationCorrespondent))
  cy.visit(baseUrl)
})

Cypress.Commands.add('createOrganisationSurvey', (orgCode, body) => {
  const today = new Date()

  cy.request({
    method: 'POST',
    url: `/api/organisations/${orgCode}/surveys`,
    headers: admin,
    body,
  })
})

Cypress.Commands.add('setUpAdminTeacherView', () => {
  const date = new Date()
  cy.request({
    method: 'PUT',
    url: '/api/test/courseRealisation/97',
    headers: admin,
    body: {
      startDate: new Date().setDate(date.getDate() - 1),
      endDate: new Date().setHours(date.getHours() - 10),
      feedbackResponse: null,
      feedbackResponseEmailSent: false,
    },
  })

  cy.request({
    method: 'PUT',
    url: '/api/test/user/hy-hlo-1441871',
    headers: admin,
    body: {
      employeeNumber: '123456789',
    },
  })
})

Cypress.Commands.add('setUpSecondaryTeacherView', () => {
  const date = new Date()
  cy.request({
    method: 'PUT',
    url: '/api/test/courseRealisations',
    headers: admin,
    body: {
      feedbackTargetIds: [163, 165],
      startDate: new Date().setHours(date.getHours() - 10),
      endDate: new Date().setDate(date.getDate() + 14),
    },
  })
  cy.request({
    method: 'PUT',
    url: '/api/test/user/hy-hlo-51367956',
    headers: admin,
    body: {
      employeeNumber: '987654321',
    },
  })
})

const setFeedbackDatesFromNow = (open, close) => {
  const date = new Date()
  cy.request({
    method: 'PUT',
    url: '/api/feedback-targets/163',
    headers: teacher,
    body: {
      opensAt: new Date().setDate(date.getDate() + open),
      closesAt: new Date().setDate(date.getDate() + close),
    },
  })
}

Cypress.Commands.add('setFeedbackActive', () => {
  setFeedbackDatesFromNow(-14, 14)
})

Cypress.Commands.add('setFeedbackNotYetOpen', () => {
  setFeedbackDatesFromNow(14, 28)
})

Cypress.Commands.add('setFeedbackClosed', () => {
  setFeedbackDatesFromNow(-28, -1)
})

Cypress.Commands.add('setFeedbackOpeningSoon', () => {
  setFeedbackDatesFromNow(6, 28)
})

Cypress.Commands.add('setFakeFeedbackCount', feedbackCount => {
  cy.request({
    method: 'PUT',
    url: '/api/test/courseRealisation/163',
    headers: admin,
    body: {
      feedbackCount,
    },
  })
})

Cypress.Commands.add('setContinuousFeedbackActive', () => {
  cy.request({
    method: 'PUT',
    url: '/api/feedback-targets/163',
    headers: teacher,
    body: {
      continuousFeedbackEnabled: true,
    },
  })
})

Cypress.Commands.add('enableCourses', () => {
  cy.request({
    method: 'PUT',
    url: '/api/test/enableCourses',
    headers: admin,
  })
})

Cypress.Commands.add('enableTestUsers', () => {
  cy.request({
    method: 'PUT',
    url: '/api/test/user/hy-hlo-1501077',
    headers: admin,
    body: {
      username: 'keolli',
    },
  })
})

Cypress.Commands.add('refreshSummary', () => {
  cy.request({
    method: 'PUT',
    url: '/api/test/refresh-summary',
    headers: admin,
  })
})

Cypress.Commands.add('seedTestStudents', () => {
  cy.request({
    method: 'POST',
    url: '/api/test/seed/user/student',
    headers: admin,
  })
})

Cypress.Commands.add('clearTestStudents', () => {
  cy.request({
    method: 'POST',
    url: '/api/test/clear/user/student',
    headers: admin,
  })
})

Cypress.Commands.add('clearOrganisationSurveys', () => {
  cy.request({
    method: 'POST',
    url: '/api/test/clear/organisation-surveys',
    headers: admin,
  })
})

Cypress.Commands.add('seedComputerScienceCorrespondents', () => {
  cy.request({
    method: 'POST',
    url: '/api/test/seed/user/correspondent/500-K005',
    headers: admin,
  })
})

Cypress.Commands.add('clearComputerScienceCorrespondents', () => {
  cy.request({
    method: 'POST',
    url: '/api/test/clear/user/correspondent/500-K005',
    headers: admin,
  })
})
