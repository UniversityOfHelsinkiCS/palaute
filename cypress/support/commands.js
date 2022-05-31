import { baseUrl } from '.'

const adminUser = {
  uid: 'mluukkai',
  givenName: 'Matti',
  mail: 'grp-toska+mockadmin@helsinki.fi',
  sn: 'Luukkainen',
  preferredLanguage: 'en',
  hyPersonSisuId: 'hy-hlo-1441871',
  employeeNumber: '9021313',
  hygroupcn: ['hy-employees'],
}

const teacher = {
  uid: 'testiman',
  givenname: 'Tommi',
  sn: 'Testaaja',
  mail: 'Tommi.testaaja@toska.fi',
  preferredlanguage: 'en',
  hyPersonSisuId: 'hy-hlo-51367956',
  employeeNumber: '123445678',
  hygroupcn: ['hy-employees'],
}

const student = {
  uid: 'oppilasolli',
  givenname: 'Olli',
  sn: 'Oppilas',
  mail: 'opiskelija@toska.fi',
  preferredLanguage: ' en',
  hyPersonSisuId: 'hy-hlo-115054920',
}

const studyCoordinator = {
  uid: 'mluukkai',
  givenname: 'Daniel',
  sn: 'Dekaani',
  mail: 'dekaani@toska.fi',
  preferredLanguage: 'en',
  hyPersonSisuId: 'hy-hlo-1501077',
  hygroupcn: ['hy-employees'],
}

Cypress.Commands.add('loginAsTeacher', () => {
  localStorage.setItem('fakeUser', JSON.stringify(adminUser))

  cy.visit(baseUrl)
})

Cypress.Commands.add('loginAsSecondaryTeacher', () => {
  localStorage.setItem('fakeUser', JSON.stringify(teacher))

  cy.visit(baseUrl)
})

Cypress.Commands.add('loginAsStudent', () => {
  localStorage.setItem('fakeUser', JSON.stringify(student))
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
    headers: adminUser,
    body: {
      startDate: new Date().setDate(date.getDate() - 1),
      endDate: new Date().setHours(date.getHours() - 10),
    },
  })

  cy.request({
    method: 'PUT',
    url: '/api/test/user/hy-hlo-1441871',
    headers: adminUser,
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
    headers: adminUser,
    body: {
      feedbackTargetIds: [163, 165],
      startDate: new Date().setHours(date.getHours() - 10),
      endDate: new Date().setDate(date.getDate() + 14),
    },
  })
  cy.request({
    method: 'PUT',
    url: '/api/test/user/hy-hlo-51367956',
    headers: adminUser,
    body: {
      employeeNumber: '987654321',
    },
  })
})

Cypress.Commands.add('setFeedbackActive', () => {
  const date = new Date()
  cy.request({
    method: 'PUT',
    url: '/api/feedback-targets/163',
    headers: teacher,
    body: {
      opensAt: new Date().setDate(date.getDate() - 14),
      closesAt: new Date().setDate(date.getDate() + 14),
    },
  })
})

Cypress.Commands.add('enableCourses', () => {
  cy.visit(baseUrl)
  cy.request({
    method: 'PUT',
    url: '/api/test/enableCourses',
    headers: adminUser,
  })
})

Cypress.Commands.add('enableTestUsers', () => {
  cy.request({
    method: 'PUT',
    url: '/api/test/user/hy-hlo-1501077',
    headers: adminUser,
    body: {
      username: 'keolli',
    },
  })
})
