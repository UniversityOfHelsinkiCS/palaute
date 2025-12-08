const { TEXT } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('feedback_targets', 'feedback_visibility', {
      type: TEXT,
      defaultValue: 'ENROLLED',
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('feedback_targets', 'feedback_visibility')
  },
}
