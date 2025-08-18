/// <reference types="cypress" />

import { admin, student, teacher } from '../fixtures/headers'

describe('Admin email stats view', () => {
  beforeEach(() => {
    cy.createFeedbackTarget()
  })
  it('shows 0 when no emails should be sent', () => {
    cy.setFeedbackNotYetOpen()
    cy.loginAs(admin)
    cy.visit(`/admin/misc`)
    cy.contains('Email statistics').click()
    cy.contains('Student emails TODAY: 0')
    cy.contains('Teacher emails TODAY: 0')
  })
  it('shows the email when feedback opening reminder to teacher email should be sent', () => {
    // Opening in a week. Then the email should be sent today.
    cy.setFeedbackOpeningSoon()
    cy.loginAs(admin)
    cy.visit(`/admin/misc`)
    cy.contains('Email statistics').click()
    cy.contains('Student emails TODAY: 0')
    cy.contains('Teacher emails TODAY: 1')
    cy.contains('Dear teacher, welcome to the University of Helsinki Norppa course feedback system!')
    cy.contains('Testauskurssi')

    // No custom questions:
    cy.contains('the following questions have been added to the survey:').should('not.exist')
  })
  it('Custom questions teacher has added are shown in opening reminder', () => {
    // Opening in a week. Then the email should be sent today.
    cy.setFeedbackOpeningSoon()

    // Go to edit view as teacher
    cy.loginAs(teacher)
    cy.getTestFbtId().as('fbtId')
    cy.get('@fbtId').then(id => cy.visit(`/targets/${id}/edit`))

    // Add two custom questions
    cy.contains('Add question').click()
    cy.get('li').contains('Scale of values').click()
    cy.get('input[id^=likert-question-en-questions]').type('Minthu custom question')
    cy.get('[data-cy=question-card-save-edit]').click()

    cy.contains('Add question').click()
    cy.get('li').contains('Scale of values').click()
    cy.get('input[id^=likert-question-en-questions]').type('Soju custom question')
    cy.get('[data-cy=question-card-save-edit]').click()

    // Go to admin view and check out the email
    cy.loginAs(admin)
    cy.visit(`/admin/misc`)
    cy.contains('Email statistics').click()
    cy.contains('Student emails TODAY: 0')
    cy.contains('Teacher emails TODAY: 1')
    cy.contains('Dear teacher, welcome to the University of Helsinki Norppa course feedback system!')
    cy.contains('Testauskurssi')
    cy.contains('the following questions have been added to the survey:')
    cy.contains('Minthu custom question')
    cy.contains('Soju custom question')
  })
  it('shows the email when feedback opening student email should be sent', () => {
    cy.setFeedbackActive()
    cy.loginAs(admin)
    cy.visit(`/admin/misc`)
    cy.contains('Email statistics').click()
    cy.contains('Student emails TODAY: 1')
    cy.contains('Teacher emails TODAY: 0')
    cy.contains('opiskelija@toska.fi')
    cy.contains('now open: Testauskurssi')
  })
  it('shows the email when feedback response reminder should be sent', () => {
    cy.loginAs(admin)
    cy.setFeedbackActive()
    cy.giveFeedback(student)
    cy.setFeedbackClosed()
    cy.visit(`/admin/misc`)
    cy.contains('Email statistics').click()
    cy.contains('Student emails TODAY: 0')
    cy.contains(/Teacher emails TODAY: [^0]/)
    cy.contains('Tommi.testaaja@toska.fi')
    cy.contains('has ended: Testauskurssi')
  })
  it('allows to run email cronjob and result in success', () => {
    cy.loginAs(admin)
    cy.visit(`/admin/misc`)
    cy.get('[data-cy=run-pate]').click()
    cy.contains('SUCCESS')
  })
})
