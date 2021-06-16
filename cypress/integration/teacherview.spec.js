describe('Teacher view', function () {
  beforeEach(function () {
    cy.loginAsTeacher()
  })
  it('A logged in teacher can view its courses', function () {
    cy.contains('Opetukseni')
    cy.contains('Käynnissä olevat kurssit (0)')
    cy.contains('Tulevat kurssit (0)')
    cy.contains('Päättyneet kurssit (6)')
  })
  it('A logged in teacher can view its ended courses', function () {
    cy.contains('Opetukseni')
    cy.contains('TKT20002 Ohjelmistotekniikka')
    cy.get('div').contains('TKT20002 Ohjelmistotekniikka').click()
    cy.contains('16.03.2021 - 08.05.2021')
    cy.get('div').contains('TKT20006 Ohjelmistotuotanto').click()
    cy.contains('Ei kurssitoteutuksia')
  })
  it('If feedback response has not been given teacher is notified', function () {
    cy.get('p')
      .contains('TKT20002 Ohjelmistotekniikka')
      .parent()
      .contains('Vastapalaute puuttuu')
  })
  it('If teacher has ongoing courses their surveys can be edited', function () {
    cy.loginAsSecondaryTeacher()
    cy.contains('Käynnissä olevat kurssit (2)')
  })
})
