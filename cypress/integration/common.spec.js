import { baseUrl } from '../support'

describe('Common tests', () => {
  it('User can change language', () => {
    cy.loginAsStudent()
    cy.contains('My feedback')
    cy.contains('Olli Oppilas').click()
    cy.contains('SV').click()
    cy.contains('Mina responser')
    cy.contains('Olli Oppilas').click()
    cy.contains('FI').click()
    cy.contains('Kurssipalautteeni')
  })
  it('CONFIG is populated correctly', () => {
    cy.loginAsAdmin()
    cy.visit(`${baseUrl}/admin/users`)
    cy.contains('HY-Minttujam')
  })
})
