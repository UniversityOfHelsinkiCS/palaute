const { BOOLEAN } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('feedback_targets', 'continuous_feedback_enabled', {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    })
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('feedback_targets', 'continuous_feedback_enabled')
  },
}
