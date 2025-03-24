/// <reference types="Cypress" />

const path = require('path')
const { summaryUser } = require('../fixtures/headers')

/**
 * For test data, see src/server/services/testServices/initSummary.js
 */
describe('Course summary', () => {
  beforeEach(() => {
    cy.request({
      method: 'POST',
      url: '/test/init-summary',
      body: summaryUser,
    })
    cy.loginAs(summaryUser)
    cy.visit(`/course-summary`)
  })

  it('Should have data in My Organisations and my courses', () => {
    cy.get('[data-cy=my-organisations]').click()

    cy.contains('TEST_SUMMARY_ORG', { timeout: 12000 })
    cy.contains('SUMMARY_TEST_COURSE')
    cy.contains('5.00')
    cy.contains('2 / 2')
    cy.contains('100%')

    cy.get('[data-cy=my-courses]').click()

    cy.contains('TEST_SUMMARY_ORG')
    cy.contains('SUMMARY_TEST_COURSE')
    cy.contains('5.00')
    cy.contains('2 / 2')
    cy.contains('100%')
  })

  it.only('Organisation summary XLSX download works and has correct data', () => {
    cy.visit('/organisations/TEST_SUMMARY_ORG/summary')

    // This opens the download menu
    cy.contains('Download XLSX').click()

    // Submit and begin download
    cy.get('[data-cy=export-xlsx-submit]').click()

    const downloadsFolder = Cypress.config('downloadsFolder')

    // Check what files are in the downloads folder
    cy.task('checkFolder', downloadsFolder).then(files => {
      // Check that a file ending with .xlsx exists
      expect(files).to.have.lengthOf(1)
      const xlsxFile = files.find(file => file.endsWith('.xlsx'))
      // eslint-disable-next-line no-unused-expressions
      expect(xlsxFile).to.exist

      // Parse the file
      cy.task('readXLSX', path.join(downloadsFolder, xlsxFile)).then(jsonData => {
        expect(jsonData).to.have.property('organisations')
        const organisationSheet = jsonData.organisations
        expect(organisationSheet).to.have.lengthOf(1)
        const organisation = organisationSheet[0]
        expect(organisation).to.have.property('Organisation code', 'TEST_SUMMARY_ORG')
        expect(organisation).to.have.property('Testikysymys 1', 5)
        expect(organisation).to.have.property('Feedback count', 2)
      })
    })
  })
})
