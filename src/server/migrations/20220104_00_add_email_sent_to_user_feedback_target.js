const { BOOLEAN } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('user_feedback_targets', 'feedback_open_email_sent', {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('user_feedback_targets', 'feedback_open_email_sent')
  },
}
