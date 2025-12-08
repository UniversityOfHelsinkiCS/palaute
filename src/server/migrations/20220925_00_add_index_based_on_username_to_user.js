module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addIndex('users', {
      fields: ['username'],
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.dropIndex('users', ['usernamne'])
  },
}
