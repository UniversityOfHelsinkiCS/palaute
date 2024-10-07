const { INTEGER } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('summaries', 'feedback_target_id', {
      type: INTEGER,
      allowNull: true,
    })
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('summaries', 'feedback_target_id')
  },
}
