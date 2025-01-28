/// <reference types="Cypress" />

import { student, teacher } from '../fixtures/headers'

describe('Teacher view', () => {
  beforeEach(() => {
    cy.createFeedbackTarget({ extraStudents: 5 })

    cy.getTestFbtId().as('fbtId')

    cy.loginAs(teacher)
  })

  it('A logged in teacher can view its courses', () => {
    cy.visit(`/courses`)

    cy.get('[id="my-teaching-title"]').contains('My surveys')

    // Checks that the tabs are rendered correctly
    cy.get('[data-cy=my-teaching-active-tab]').contains('Active').should('exist').click()
    cy.get('[data-cy="my-teaching-no-courses"]').should('exist')

    cy.get('[data-cy=my-teaching-upcoming-tab]').contains('Upcoming').should('exist').click()
    cy.get('[data-cy="my-teaching-no-courses"]').should('exist')

    cy.get('[data-cy="my-teaching-ended-tab"]').contains('Ended').should('exist').click()

    cy.get('[data-cy="my-teaching-no-courses"]').should('not.exist')

    cy.get('[data-cy="course-unit-group-title-Course surveys"]')
      .should('exist')
      .children()
      .should('have.length', 1)
      .should('have.attr', 'aria-label', '1 Survey')

    cy.get('[data-cy="course-unit-group-title-Organisation surveys"').should('not.exist')
    cy.get('[data-cy="course-unit-group-expand-more"').should('not.exist')

    cy.get('[data-cy=my-teaching-course-unit-accordion-TEST_COURSE]').should('exist').click()

    cy.get('@fbtId').then(id => {
      cy.get(`[data-cy="my-teaching-feedback-target-period-info-${id}"]`).should('exist')
      cy.get(`[data-cy="my-teaching-feedback-target-item-link-${id}"]`).should('exist')
      cy.get(`a[href*="/targets/${id}"]`).first().click()
    })
  })

  it('Teacher view feedback chips are rendered correctly', () => {
    // Continuous feedback chip is rendered
    cy.visit(`/courses`)
    cy.setFeedbackOpeningSoon()
    cy.setContinuousFeedbackActive()

    cy.get('[data-cy=my-teaching-ended-tab]').contains('Ended').as('endedTab')

    cy.get('@endedTab').click()

    cy.get('[data-cy=my-teaching-course-unit-accordion-TEST_COURSE]').should('exist').click()

    cy.get('@fbtId').then(id => {
      cy.get(`[data-cy="my-teaching-feedback-target-item-link-${id}"]`).should('exist')
      cy.get(`[data-cy="my-teaching-feedback-target-period-info-${id}"]`).should('exist')

      cy.get(`[data-cy="feedback-response-chip-continuous-${id}"]`).should('exist')
    })

    // Ongoing feedback chip is rendered
    cy.setFeedbackActive()
    cy.visit(`/courses`)

    cy.get('[data-cy=my-teaching-active-tab]').contains('Active').should('exist').click()
    cy.get('[data-cy="my-teaching-no-courses"]').should('not.exist')

    cy.get('[data-cy=my-teaching-course-unit-item-TEST_COURSE]').should('exist')
    cy.get('@fbtId').then(id => {
      cy.get(`[data-cy="my-teaching-feedback-target-item-link-${id}"]`).should('exist')
      cy.get(`[data-cy="my-teaching-feedback-target-period-info-${id}"]`).should('exist')

      cy.get(`[data-cy="feedback-response-chip-open-${id}"]`).click()
    })

    // Counter feedback chip is rendered for ended course
    cy.visit(`/courses`)

    cy.giveFeedback(student)
    cy.setFeedbackClosed()

    // Check that the missing counter feedback badge is rendered on the status tabs
    cy.visit(`/courses`)
    cy.get('[data-cy=my-teaching-ended-tab]').contains('Ended').as('endedTab')

    cy.get('@endedTab').click()

    cy.get('[data-cy="status-tab-badge"]').as('badge')

    cy.get('@badge').contains('1').should('exist')

    cy.get('[data-cy=my-teaching-ended-tab]').trigger('mouseover')
    cy.contains('Ended: 1 missing counter feedbacks from the last academic year').should('be.visible')

    // Check that the counter feedback missing chip is rendered on the CU level
    cy.get('[data-cy=my-teaching-course-unit-accordion-TEST_COURSE]').should('exist')
    cy.get('@fbtId').then(id => {
      cy.get(`[data-cy="feedback-response-chip-missing-${id}"]`)
    })

    // Check that the counter feedback missing chip is rendered on the feedback target level
    cy.get('[data-cy=my-teaching-course-unit-accordion-TEST_COURSE]').should('exist').click()
    cy.get('@fbtId').then(id => {
      cy.get(`[data-cy="my-teaching-feedback-target-item-link-${id}"]`).should('exist')
      cy.get(`[data-cy="my-teaching-feedback-target-period-info-${id}"]`).should('exist')

      cy.get(`[data-cy="feedback-response-chip-missing-${id}"]`)
    })

    // Check that the counter feedback given chip is rendered on the feedback target level

    cy.get('@fbtId').then(id => {
      cy.get(`[data-cy="my-teaching-feedback-target-item-link-${id}"]`).should('exist')
      cy.get(`[data-cy="my-teaching-feedback-target-period-info-${id}"]`).should('exist')

      cy.get(`[data-cy="feedback-response-chip-missing-${id}"]`).first().click()
    })

    cy.get('textarea').first().type('Counter feedback for students to see')
    // Do not send the email
    cy.get('[data-cy="feedback-response-send-email-checkbox"]').click()
    cy.get('[data-cy=openFeedbackResponseSubmitDialog]').click()

    cy.visit(`/courses`)
    cy.get('[data-cy=my-teaching-ended-tab]').as('endedTab')

    cy.get('@endedTab').click()

    cy.get('[data-cy=my-teaching-course-unit-accordion-TEST_COURSE]').should('exist').click()
    cy.get('@fbtId').then(id => {
      cy.get(`[data-cy="my-teaching-feedback-target-item-link-${id}"]`).should('exist')
      cy.get(`[data-cy="my-teaching-feedback-target-period-info-${id}"]`).should('exist')

      cy.get(`[data-cy="feedback-response-chip-not-sent-${id}"]`).first().click()
    })

    // Send the feedback response email, which should render a new chip after the response is sent
    cy.get('[data-cy=openFeedbackResponseSubmitDialog]').click()
    cy.get('[data-cy=saveFeedbackResponse]').click()

    cy.visit(`/courses`)
    cy.get('[data-cy=my-teaching-ended-tab]').as('endedTab')

    cy.get('@endedTab').click()

    cy.get('[data-cy=my-teaching-course-unit-accordion-TEST_COURSE]').should('exist').click()
    cy.get('@fbtId').then(id => {
      cy.get(`[data-cy="my-teaching-feedback-target-item-link-${id}"]`).should('exist')
      cy.get(`[data-cy="my-teaching-feedback-target-period-info-${id}"]`).should('exist')

      cy.get(`[data-cy="feedback-response-chip-given-${id}"]`).first().click()
    })

    // Interim feedback chip is rendered
    cy.visit(`/courses`)
    cy.setFeedbackActive()

    const today = new Date()
    const interimFeedbackBody = {
      name: {
        fi: 'Testi välipalaute',
        en: 'Test interim feedback',
        sv: '',
      },
      startDate: today,
      endDate: new Date().setDate(today.getDate() + 7),
    }

    cy.get('@fbtId').then(parentId => {
      cy.createInterimFeedback(parentId, interimFeedbackBody)

      cy.get(`[data-cy="my-teaching-active-tab"]`).contains('Active').should('exist').click()
      cy.get(`[data-cy="my-teaching-course-unit-item-TEST_COURSE"]`).should('exist')
      cy.get(`[data-cy="my-teaching-feedback-target-item-link-${parentId}"]`).should('exist')
      cy.get(`[data-cy="my-teaching-feedback-target-period-info-${parentId}"]`).should('exist')

      cy.get(`[data-cy="interim-feedback-chip-${parentId}"]`).should('exist')
    })
  })

  it('A logged in teacher can give counter feedback for an ended course', () => {
    cy.setFeedbackClosed()

    cy.visit(`/courses`)
    cy.get('[data-cy=my-teaching-ended-tab]').contains('Ended').should('exist').click()

    cy.get('[data-cy=my-teaching-course-unit-accordion-TEST_COURSE]').click()

    cy.get('@fbtId').then(id => cy.visit(`/targets/${id}/edit-feedback-response`))

    cy.get('textarea').first().type('Counter feedback for students to see')
    cy.get('[data-cy=openFeedbackResponseSubmitDialog]').click()
    cy.get('[data-cy=saveFeedbackResponse]').click()

    cy.visit(`/courses`)
    cy.get('[data-cy=my-teaching-ended-tab]').contains('Ended').click()

    cy.contains('TEST_COURSE').click()

    cy.get('@fbtId').then(id => cy.get(`[data-cy=feedback-response-chip-given-${id}]`))
  })

  it('Teacher can add questions to a survey', () => {
    cy.get('@fbtId').then(id => cy.visit(`/targets/${id}/edit`))
    cy.contains('Add question').click()
    cy.get('li').contains('Scale of values').click()
    cy.get('input[id^=likert-question-en-questions]').type('Test question')
    cy.get('input[id^=likert-description-en-questions]').type('Test description')

    cy.get('[data-cy=question-card-save-edit]').click()
    cy.reload()
    cy.contains('Test question')
    cy.contains('Test description')
  })

  it('Teacher can edit a question', () => {
    cy.get('@fbtId').then(id => cy.visit(`/targets/${id}/edit`))
    cy.contains('Add question').click()
    cy.get('li').contains('Scale of values').click()
    cy.get('input[id^=likert-question-en-questions]').type('Test question')
    cy.get('input[id^=likert-description-en-questions]').type('Test description')
    cy.get('[data-cy=question-card-save-edit]').click()
    cy.reload()

    cy.get('[data-cy=editQuestion]').first().click()
    cy.get('input[id^=likert-question-en-questions]').type(' edited')
    cy.get('input[id^=likert-description-en-questions]').type(' edited')
    cy.get('[data-cy=question-card-save-edit]').click()
    cy.reload()
    cy.contains('Test question edited')
    cy.contains('Test description edited')
  })

  it('Teacher can view survey results', () => {
    cy.setFeedbackActive()
    cy.giveFeedback(student)
    cy.visit(`/courses`)
    cy.get('div').contains('TEST_COURSE').click()
    cy.get('@fbtId').then(id => cy.get(`a[href*="/targets/${id}"]`).first().click())
    cy.get('@fbtId').then(id => cy.visit(`/targets/${id}/results`))
    cy.contains('Feedback').click()
    cy.contains('Multiple choice questions')
  })
})
