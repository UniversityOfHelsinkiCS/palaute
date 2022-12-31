const { BOOLEAN } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('continuous_feedbacks', 'response_email_sent', {
      type: BOOLEAN,
      defaultValue: false,
      allowNull: false,
    })
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('continuous_feedbacks', 'response_email_sent')
  },
}
