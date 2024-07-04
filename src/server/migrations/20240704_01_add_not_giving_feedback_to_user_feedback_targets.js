const { BOOLEAN } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('user_feedback_targets', 'not_giving_feedback', { type: BOOLEAN })
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('user_feedback_targets', 'not_giving_feedback')
  },
}
