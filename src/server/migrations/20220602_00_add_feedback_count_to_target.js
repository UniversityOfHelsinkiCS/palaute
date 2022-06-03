const { INTEGER } = require('sequelize')

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addColumn('feedback_targets', 'feedback_count', {
      type: INTEGER,
      defaultValue: 0,
      allowNull: false,
    })
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('feedback_targets', 'feedback_count')
  },
}
