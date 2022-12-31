const { STRING, TEXT } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.changeColumn('feedback_targets', 'feedback_response', {
      type: TEXT,
    })
  },
  down: async queryInterface => {
    await queryInterface.changeColumn('feedback_targets', 'feedback_response', {
      type: STRING(5000),
    })
  },
}
