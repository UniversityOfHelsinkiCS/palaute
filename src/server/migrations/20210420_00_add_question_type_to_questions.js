const { STRING } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('questions', 'type', {
      type: STRING,
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('questions', 'type')
  },
}
