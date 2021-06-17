describe('Teacher view', function () {
  beforeEach(function () {
    cy.loginAsTeacher()
  })
  it('A logged in teacher can view its courses', function () {
    cy.contains('My teaching')
    cy.contains('Ongoing courses (0)')
    cy.contains('Upcoming courses (0)')
    cy.contains('Ended courses (1)')
  })
  it('A logged in teacher can view its ended courses', function () {
    cy.contains('My teaching')
    cy.contains('TKT20002 Software Development Methods')
    cy.get('div').contains('TKT20002 Software Development Methods').click()
    cy.contains('16.03.2021 - 08.05.2021')
  })
  it('If feedback response has not been given teacher is notified', function () {
    cy.get('p')
      .contains('TKT20002 Software Development Methods')
      .parent()
      .contains('Counter feedback missing')
  })
  it('If teacher has ongoing courses their surveys can be edited', function () {
    cy.loginAsSecondaryTeacher()
    cy.contains('Ongoing courses (2)')
  })
})
