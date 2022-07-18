const { DATE, DATEONLY } = require('sequelize')

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addColumn(
      'feedback_summary_cache',
      'course_realisation_start_date',
      {
        type: DATEONLY,
        allowNull: false,
      },
    )
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn(
      'feedback_summary_cache',
      'course_realisation_start_date',
    )
  },
}
