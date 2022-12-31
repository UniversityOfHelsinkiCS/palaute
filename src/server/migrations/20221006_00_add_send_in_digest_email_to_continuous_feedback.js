const { BOOLEAN } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('continuous_feedbacks', 'send_in_digest_email', {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    })
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('continuous_feedbacks', 'send_in_digest_email')
  },
}
