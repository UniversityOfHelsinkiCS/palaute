import { admin, teacher } from '../fixtures/headers'
import { baseUrl } from './baseUrl'

Cypress.Commands.add('loginAs', user => {
  localStorage.setItem('fakeUser', JSON.stringify(user))
  cy.visit(`${baseUrl}`)
})

/**
 * Custom Cypress command to create an organization survey.
 *
 * @param {string} orgCode - The organization code for which the survey is being created.
 * @param {Object} body - The request body for creating the organization survey.
 *
 * @example
 * // Usage in Cypress test
 * cy.createOrganisationSurvey('your_org_code', {
 *   // your survey creation data here
 * })
 *
 * @returns {void}
 *
 * @throws {Error} Will throw an error if the command encounters any issues.
 */
Cypress.Commands.add('createOrganisationSurvey', (orgCode, body) => {
  cy.request({
    method: 'POST',
    url: `/api/organisations/${orgCode}/surveys`,
    headers: admin,
    body,
  }).then(response => {
    cy.wrap(response.body).as('organisationSurvey')
  })
})

/**
 * Custom Cypress command to give feedback for an organization survey.
 *
 * Given header is the student that the feedback is given as.
 * Be sure that the headers match the students in the survey otherwise it is not possible to give feedback
 *
 * The feedback is given to the organisation survey created using the 'createOrganisationSurvey' Cypress Command.
 *
 * @memberOf Cypress.Chainable
 *
 * @param {Object} headers - The headers for the HTTP request, see cypress/fixtures/headers.js
 *
 * @see createOrganisationSurvey
 *
 * @returns {Cypress.Chainable} Yields the original survey object for further chaining.
 */
Cypress.Commands.add('giveOrganisationSurveyFeedback', headers => {
  cy.get('@organisationSurvey').then(survey => {
    const body = {
      feedbackTargetId: survey.id,
      data: [],
    }

    cy.request({
      method: 'POST',
      url: '/api/feedbacks',
      headers,
      body,
    })
  })
})

/**
 * Custom Cypress command to give feedback for an interim feedback.
 *
 * Given header is the student that the feedback is given as.
 * Be sure that the headers match the students in the survey otherwise it is not possible to give feedback
 *
 * The feedback is given to the organisation survey created using the 'createInterimFeedback' Cypress Command.
 *
 * @memberOf Cypress.Chainable
 *
 * @param {Object} headers - The headers for the HTTP request, see cypress/fixtures/headers.js
 *
 * @see createInterimFeedback
 *
 * @returns {Cypress.Chainable} Yields the original survey object for further chaining.
 */
Cypress.Commands.add('giveInterimFeedback', headers => {
  cy.get('@interimFeedback').then(interimFeedback => {
    const body = {
      feedbackTargetId: interimFeedback.id,
      data: [],
    }

    cy.request({
      method: 'POST',
      url: '/api/feedbacks',
      headers,
      body,
    })
  })
})

/**
 * Custom Cypress command to create an interim feedback.
 *
 * @param {string} parentId - The feedback target id that the interim feedback will be created to
 * @param {Object} body - The request body for creating the interim feedback.
 *
 * @example
 * // Usage in Cypress test
 * cy.createInterimFeedback('163', {
 *  name: {
 *    fi: "Uusi välipalaute",
 *    en: "New interim feedback",
 *    sv: "",
 *  },
 *  startDate: new Date(),
 *  endDate: new Date()
 * })
 *
 * @returns {void}
 *
 * @throws {Error} Will throw an error if the command encounters any issues.
 */
Cypress.Commands.add('createInterimFeedback', (parentId, body) => {
  cy.request({
    method: 'POST',
    url: `/api/feedback-targets/${parentId}/interimFeedbacks`,
    headers: admin,
    body,
  }).then(response => {
    cy.wrap(response.body).as('interimFeedback')
  })
})

const setFeedbackDatesFromNow = (open, close) => {
  const date = new Date()
  cy.request({
    method: 'GET',
    url: '/test/test-fbt-id',
  }).then(response => {
    cy.request({
      method: 'PUT',
      url: `/api/feedback-targets/${response.body.id}`,
      headers: admin,
      body: {
        opensAt: new Date().setDate(date.getDate() + open),
        closesAt: new Date().setDate(date.getDate() + close),
      },
    })
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
    method: 'GET',
    url: '/test/test-fbt-id',
  }).then(response => {
    cy.request({
      method: 'PUT',
      url: `/test/courseRealisation/${response.body.id}`,
      body: {
        feedbackCount,
      },
    })
  })
})

Cypress.Commands.add('setContinuousFeedbackActive', () => {
  cy.request({
    method: 'GET',
    url: '/test/test-fbt-id',
  }).then(response => {
    cy.request({
      method: 'PUT',
      url: `/api/feedback-targets/${response.body.id}`,
      headers: admin,
      body: {
        continuousFeedbackEnabled: true,
      },
    })
  })
})

Cypress.Commands.add('enableTestUsers', () => {
  cy.request({
    method: 'PUT',
    url: '/test/user/hy-hlo-1501077',
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

/**
 * Custom Cypress command to seed test students for testing purposes.
 *
 * @example
 * // Usage in Cypress test
 * cy.seedTestStudents();
 *
 * @returns {void}
 *
 * @throws {Error} Will throw an error if the command encounters any issues.
 */
Cypress.Commands.add('seedTestStudents', () => {
  cy.request({
    method: 'POST',
    url: '/api/test/seed/user/student',
    headers: admin,
  })
})

/**
 * Custom Cypress command to clear test students for testing purposes.
 *
 * @example
 * // Usage in Cypress test
 * cy.clearTestStudents();
 *
 * @returns {void}
 *
 * @throws {Error} Will throw an error if the command encounters any issues.
 */
Cypress.Commands.add('clearTestStudents', () => {
  cy.request({
    method: 'POST',
    url: '/api/test/clear/user/student',
    headers: admin,
  })
})

/**
 * Custom Cypress command to clear organization surveys for testing purposes.
 *
 * @example
 * // Usage in Cypress test
 * cy.clearOrganisationSurveys();
 *
 * @returns {void}
 *
 * @throws {Error} Will throw an error if the command encounters any issues.
 */
Cypress.Commands.add('clearOrganisationSurveys', () => {
  cy.request({
    method: 'POST',
    url: '/api/test/clear/organisation-surveys',
    headers: admin,
  })
})

/**
 * Custom Cypress command to clear interim feedbacks for testing purposes.
 *
 * @example
 * // Usage in Cypress test
 * cy.clearInterimFeedbacks();
 *
 * @returns {void}
 *
 * @throws {Error} Will throw an error if the command encounters any issues.
 */
Cypress.Commands.add('clearInterimFeedbacks', () => {
  cy.request({
    method: 'POST',
    url: '/api/test/clear/interim-feedbacks',
    headers: admin,
  })
})

/**
 * Custom Cypress command to seed computer science correspondents for testing purposes.
 *
 * @example
 * // Usage in Cypress test
 * cy.seedComputerScienceCorrespondents();
 *
 * @returns {void}
 *
 * @throws {Error} Will throw an error if the command encounters any issues.
 */
Cypress.Commands.add('seedComputerScienceCorrespondents', () => {
  cy.request({
    method: 'POST',
    url: '/api/test/seed/user/correspondent/500-K005',
    headers: admin,
  })
})

/**
 * Custom Cypress command to clear computer science correspondents for testing purposes.
 *
 * @example
 * // Usage in Cypress test
 * cy.clearComputerScienceCorrespondents();
 *
 * @returns {void}
 *
 * @throws {Error} Will throw an error if the command encounters any issues.
 */
Cypress.Commands.add('clearComputerScienceCorrespondents', () => {
  cy.request({
    method: 'POST',
    url: '/api/test/clear/user/correspondent/500-K005',
    headers: admin,
  })
})
