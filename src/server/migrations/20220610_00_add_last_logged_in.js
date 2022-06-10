const { DATE } = require('sequelize')

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addColumn('users', 'last_logged_in', {
      type: DATE,
      allowNull: true,
    })
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('users', 'last_logged_in')
  },
}
