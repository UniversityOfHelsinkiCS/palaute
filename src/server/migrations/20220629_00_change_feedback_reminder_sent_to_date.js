const { BOOLEAN } = require('sequelize')
const { DATE } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('feedback_targets', 'feedback_reminder_last_sent_at', {
      type: DATE,
      allowNull: true,
      defaultValue: null,
    })

    await queryInterface.removeColumn('feedback_targets', 'feedback_reminder_email_to_students_sent')
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('feedback_targets', 'feedback_reminder_email_to_students_sent', {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    })

    await queryInterface.sequelize.query(`
      UPDATE feedback_targets SET feedback_reminder_email_to_students_sent = true
      WHERE feedback_reminder_last_sent_at IS NOT NULL;
    `)

    await queryInterface.removeColumn('feedback_targets', 'feedback_reminder_last_sent_at')
  },
}
