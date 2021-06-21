const adminUser = {
  uid: 'mluukkai',
  givenName: 'Matti',
  mail: 'grp-toska+mockadmin@helsinki.fi',
  sn: 'Luukkainen',
  preferredLanguage: 'en',
  hyPersonSisuId: 'hy-hlo-1441871',
  employeeNumber: '9021313',
}

const teacher = {
  uid: 'testiman',
  givenname: 'Tommi',
  sn: 'Testaaja',
  mail: 'Tommi.testaaja@toska.fi',
  preferredlanguage: 'en',
  hyPersonSisuId: 'hy-hlo-51367956',
  employeeNumber: '123445678',
}

Cypress.Commands.add('loginAsTeacher', () => {
  localStorage.setItem('fakeUser', JSON.stringify(adminUser))

  cy.visit('localhost:8000')
})

Cypress.Commands.add('loginAsSecondaryTeacher', () => {
  localStorage.setItem('fakeUser', JSON.stringify(teacher))

  cy.visit('localhost:8000')
})

Cypress.Commands.add('loginAsStudent', () => {
  localStorage.setItem(
    'fakeUser',
    JSON.stringify({
      uid: 'oppilasolli',
      givenname: 'Olli',
      sn: 'Oppilas',
      mail: 'opiskelija@toska.fi',
      preferredLanguage: ' en',
      hyPersonSisuId: 'hy-hlo-115054920',
    }),
  )
  cy.visit('localhost:8000')
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
