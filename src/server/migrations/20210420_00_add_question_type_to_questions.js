const { STRING } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('questions', 'type', {
      type: STRING,
    })
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('questions', 'type')
  },
}
