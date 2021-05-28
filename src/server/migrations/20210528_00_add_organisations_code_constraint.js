module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addConstraint('organisations', {
      fields: ['code'],
      type: 'unique',
      name: 'organisations_code',
    })
  },
  down: async (queryInterface) => {
    await queryInterface.removeConstraint('organisations_code')
  },
}
