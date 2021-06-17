describe('User feedbacks view', function () {
    beforeEach(function () {
      cy.loginAsStudent()
    })
    it('A logged in student can see its feedback page', function () {
        cy.contains('My feedbacks')
        cy.contains('Nothing to see here. Come back later!')
    })
})