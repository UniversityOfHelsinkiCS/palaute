const { TEXT } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('feedback_targets', 'continuous_feedback_preamble', {
      type: TEXT,
    })
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('feedback_targets', 'continuous_feedback_preamble')
  },
}
