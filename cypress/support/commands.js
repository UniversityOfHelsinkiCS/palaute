import { baseUrl } from './baseUrl'
import { admin, teacher, student, studyCoordinator } from '../fixtures/headers'

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

Cypress.Commands.add('loginAsStudent', () => {
  localStorage.setItem('fakeUser', JSON.stringify(student))
  // cy.reload(true)
  cy.visit(baseUrl)
})

Cypress.Commands.add('loginAsStudyCoordinator', () => {
  localStorage.setItem('fakeUser', JSON.stringify(studyCoordinator))
  cy.visit(baseUrl)
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

Cypress.Commands.add('seedUsers', () => {
  cy.request({
    method: 'POST',
    url: '/api/test/seed/user',
    headers: admin,
  })
})

Cypress.Commands.add('clearUsers', () => {
  cy.request({
    method: 'POST',
    url: '/api/test/clear/user',
    headers: admin,
  })
})
