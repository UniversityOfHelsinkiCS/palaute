const { STRING } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('organisations', 'code', {
      type: STRING,
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('organisations', 'code')
  },
}
