import { baseUrl } from '../support'

describe('Admin email stats view', () => {
  it('shows 0 when no emails should be sent', () => {
    cy.setFeedbackNotYetOpen()
    cy.loginAsAdmin()
    cy.visit(`${baseUrl}/admin/misc`)
    cy.contains('Email statistics').click()
    cy.contains('Student emails TODAY: 0')
    cy.contains('Teacher emails TODAY: 0')
  })
  it('shows the email when feedback opening student email should be sent', () => {
    cy.setFeedbackActive()
    cy.loginAsAdmin()
    cy.visit(`${baseUrl}/admin/misc`)
    cy.contains('Email statistics').click()
    cy.contains('Student emails TODAY: 1')
    cy.contains('Teacher emails TODAY: 0')
    cy.contains('opiskelija@toska.fi')
    cy.contains('now open: Functional Programming I')
  })
  it('shows the email when feedback response reminder should be sent', () => {
    cy.setFakeFeedbackCount(10)
    cy.setFeedbackClosed()
    cy.loginAsAdmin()
    cy.visit(`${baseUrl}/admin/misc`)
    cy.contains('Email statistics').click()
    cy.contains('Student emails TODAY: 0')
    cy.contains(/Teacher emails TODAY: [^0]/)
    cy.contains('Tommi.testaaja@toska.fi')
    cy.contains('has ended: Functional Programming I')
  })
  it('allows to run email cronjob and result in success', () => {
    cy.loginAsAdmin()
    cy.visit(`${baseUrl}/admin/misc`)
    cy.get('[data-cy=run-pate]').click()
    cy.contains('SUCCESS')
  })
})
