const { STRING } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('feedback_targets', 'feedback_response', {
      type: STRING,
    })
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('feedback_targets', 'feedback_response')
  },
}
