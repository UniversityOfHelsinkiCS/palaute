module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addConstraint('organisations', {
      fields: ['code'],
      type: 'unique',
      name: 'organisations_code',
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeConstraint('organisations_code')
  },
}
