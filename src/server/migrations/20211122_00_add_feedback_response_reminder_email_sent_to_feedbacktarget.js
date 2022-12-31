const { BOOLEAN } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('feedback_targets', 'feedback_response_reminder_email_sent', {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    })
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('feedback_targets', 'feedback_response_reminder_email_sent')
  },
}
