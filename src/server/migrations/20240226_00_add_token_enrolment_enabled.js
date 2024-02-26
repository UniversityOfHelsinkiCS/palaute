const { BOOLEAN } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('feedback_targets', 'token_enrolment_enabled', {
      type: BOOLEAN,
      defaultValue: false,
    })
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('feedback_targets', 'token_enrolment_enabled')
  },
}
