const { STRING } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.changeColumn('feedback_targets', 'feedback_response', {
      type: STRING(5000),
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.changeColumn('feedback_targets', 'feedback_response', {
      type: STRING,
    })
  },
}
