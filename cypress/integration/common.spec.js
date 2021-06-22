describe('Common tests', function () {
  it('User can change language', function () {
    cy.loginAsStudent()
    cy.contains('My feedbacks')
    cy.contains('Olli Oppilas').click()
    cy.contains('SV').click()
    cy.contains('Mina responser')
    cy.contains('Olli Oppilas').click()
    cy.contains('FI').click()
    cy.contains('Kurssipalautteeni')
  })
})
