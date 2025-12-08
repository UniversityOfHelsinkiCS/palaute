const { INTEGER } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('surveys', 'feedback_target_id', {
      type: INTEGER,
      allowNull: false,
      references: { model: 'feedback_targets', key: 'id' },
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('surveys', 'feedback_target_id')
  },
}
