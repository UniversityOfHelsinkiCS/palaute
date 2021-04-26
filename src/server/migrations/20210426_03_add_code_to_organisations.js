const { STRING } = require('sequelize')

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addColumn('organisations', 'code', {
      type: STRING,
    })
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('organisations', 'code')
  },
}
