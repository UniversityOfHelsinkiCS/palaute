const { BOOLEAN } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('continuous_feedbacks', 'response_email_sent', {
      type: BOOLEAN,
      defaultValue: false,
      allowNull: false,
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('continuous_feedbacks', 'response_email_sent')
  },
}
