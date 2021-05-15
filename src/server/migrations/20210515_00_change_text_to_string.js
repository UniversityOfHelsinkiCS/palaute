const { STRING } = require('sequelize')

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.changeColumn('feedback_targets', 'feedback_response', {
      type: STRING(5000),
    })
  },
  down: async (queryInterface) => {
    await queryInterface.changeColumn('feedback_targets', 'feedback_response', {
      type: STRING,
    })
  },
}
