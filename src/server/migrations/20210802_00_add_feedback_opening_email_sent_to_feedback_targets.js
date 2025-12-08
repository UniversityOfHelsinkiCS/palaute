const { BOOLEAN } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('feedback_targets', 'feedback_opening_reminder_email_sent', {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('feedback_targets', 'feedback_opening_reminder_email_sent')
  },
}
