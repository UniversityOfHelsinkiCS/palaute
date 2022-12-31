module.exports = {
  up: async queryInterface => {
    await queryInterface.addIndex('users', {
      fields: ['username'],
    })
  },
  down: async queryInterface => {
    await queryInterface.dropIndex('users', ['usernamne'])
  },
}
