import { addDays } from 'date-fns'
import { admin, student, teacher } from '../fixtures/headers'

Cypress.Commands.add('loginAs', user => {
  localStorage.setItem('fakeUser', JSON.stringify(user))
  cy.visit(`/`)
})

Cypress.Commands.add('buildSummaries', () => {
  cy.request({
    method: 'POST',
    url: '/api/admin/build-summaries',
    headers: admin,
  })
})

Cypress.Commands.add('giveFeedback', headers => {
  cy.getTestFbtId().then(id => {
    cy.getUniversityQuestions().then(questionIds => {
      cy.request({
        method: 'POST',
        url: '/api/feedbacks',
        headers,
        body: {
          feedbackTargetId: id,
          data: questionIds.map(q => ({ questionId: q.id, data: '3' })),
        },
      })
    })
  })
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
Cypress.Commands.add('giveOrganisationSurveyFeedback', headers =>
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
      retryOnStatusCodeFailure: true,
    })
  })
)

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

Cypress.Commands.add('createFeedbackTarget', ({ enrolledStudent = student, extraStudents = 0 } = {}) => {
  cy.request({
    method: 'POST',
    url: 'test/seed-feedback-targets',
    body: {
      teacher,
      student: enrolledStudent,
      opensAt: addDays(new Date(), 1),
      closesAt: addDays(new Date(), 2),
      extraStudents,
    },
    headers: admin,
  })
    .then(response => {
      cy.wrap(response.body).as('feedbackTarget')
    })
    .then(() => cy.buildSummaries())
})

Cypress.Commands.add('getTestFbtId', () =>
  cy
    .request({
      method: 'GET',
      url: '/test/test-fbt-id',
    })
    .then(response => {
      cy.wrap(response.body.id).as('testFbtId')
    })
)

Cypress.Commands.add('getUniversityQuestions', () =>
  cy

    .request({
      method: 'GET',
      url: '/test/university-questions',
    })
    .then(response => {
      cy.wrap(response.body).as('universityQuestions')
    })
)

const setFeedbackDatesFromNow = (open, close) => {
  const date = new Date()
  cy.getTestFbtId().then(id => {
    cy.request({
      method: 'PUT',
      url: `/api/feedback-targets/${id}`,
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

Cypress.Commands.add('setContinuousFeedbackActive', () => {
  cy.getTestFbtId().then(id => {
    cy.request({
      method: 'PUT',
      url: `/api/feedback-targets/${id}`,
      headers: admin,
      body: {
        continuousFeedbackEnabled: true,
      },
    })
  })
})

Cypress.Commands.add('seedTestOrgCorrespondent', user => {
  cy.request({
    method: 'POST',
    url: '/test/seed-organisation-correspondent',
    body: { user },
  })
})
