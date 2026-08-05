/// <reference types="cypress" />

import { admin, studentVeikko } from '../fixtures/headers'

describe('Common tests', () => {
  it('User can change language', () => {
    cy.loginAs(studentVeikko)
    cy.contains('My feedback')
    cy.contains('Testaaja').click()
    cy.contains('SV').click()
    cy.contains('Mina responser')

    // The chosen language must also survive navigation
    cy.get('[data-cy="navbar-link-Bläddra kurser"]').click()
    cy.contains('Sök programmets kurser')

    cy.contains('Testaaja').click()
    cy.contains('FI').click()
    cy.contains('Hae ohjelman opetusta')
  })
  it('CONFIG is populated correctly', () => {
    cy.loginAs(admin)
    cy.visit(`/admin/users`)
    cy.contains('HY-Minttujam')
    cy.contains('Pahaminttu').should('not.exist')
  })
  it('Custom translation override is loaded correctly', () => {
    cy.loginAs(admin)
    cy.visit(`/admin/users`)
    cy.contains('Illuminati-silmä')
  })
  it('Error view is shown when a component throws during render', () => {
    cy.loginAs(admin)
    cy.visit(`/admin/`)
    cy.get('[data-cy=errorButton]').click()
    cy.get('[data-cy=errorView]').should('exist')
  })
})
