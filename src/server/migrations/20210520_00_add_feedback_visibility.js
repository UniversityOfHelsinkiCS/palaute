const { TEXT } = require('sequelize')

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addColumn('feedback_targets', 'feedback_visibility', {
      type: TEXT,
      defaultValue: 'ENROLLED',
    })
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('feedback_targets', 'feedback_visibility')
  },
}
