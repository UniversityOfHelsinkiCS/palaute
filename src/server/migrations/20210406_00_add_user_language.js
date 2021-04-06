const { STRING } = require('sequelize')

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addColumn('users', 'language', {
      type: STRING,
    })
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('users', 'language')
  },
}
