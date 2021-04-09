const { INTEGER } = require('sequelize')

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addColumn('surveys', 'feedback_target_id', {
      type: INTEGER,
      allowNull: false,
      references: { model: 'feedback_targets', key: 'id' },
    })
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('surveys', 'feedback_target_id')
  },
}
