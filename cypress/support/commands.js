// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('loginAsTeacher', () => {
  localStorage.setItem(
    'fakeUser',
    JSON.stringify({
      uid: 'mluukkai',
      givenName: 'Matti',
      mail: 'grp-toska+mockadmin@helsinki.fi',
      sn: 'Luukkainen',
      preferredLanguage: 'fi',
      hyPersonSisuId: 'hy-hlo-1441871',
      employeeNumber: '9021313',
    }),
  )

  cy.visit('localhost:8000')
})

Cypress.Commands.add('logout', () => {
  localStorage.clear()
})

Cypress.Commands.add('loginAsSecondaryTeacher', () => {
  localStorage.setItem(
    'fakeUser',
    JSON.stringify({
      uid: 'testiman',
      givenname: 'Tommi',
      sn: 'Testaaja',
      mail: 'Tommi.testaaja@toska.fi',
      preferredlanguage: 'fi',
      hyPersonSisuId: 'hy-hlo-51367956',
      employeeNumber: '123445678'
    }),
  )

  cy.visit('localhost:8000')
})
