import { baseUrl } from '../support'

describe('Admin email stats view', () => {
  it('calculates email counts', () => {
    cy.loginAsAdmin()
    cy.visit(`${baseUrl}/admin/misc`)
    cy.contains('Email statistics').click()
    cy.contains('Student emails TODAY: 0')
  })
})
