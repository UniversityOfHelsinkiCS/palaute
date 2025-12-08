const { INTEGER } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('summaries', 'feedback_target_id', {
      type: INTEGER,
      allowNull: true,
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('summaries', 'feedback_target_id')
  },
}
