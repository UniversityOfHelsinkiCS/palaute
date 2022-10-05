const { BOOLEAN } = require('sequelize')

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addColumn(
      'feedback_targets',
      'send_continuous_feedback_digest_email',
      {
        type: BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    )
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn(
      'feedback_targets',
      'send_continuous_feedback_digest_email',
    )
  },
}
