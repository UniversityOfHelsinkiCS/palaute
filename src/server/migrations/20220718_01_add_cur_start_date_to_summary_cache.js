const { DATEONLY } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`
      DELETE FROM feedback_summary_cache WHERE true;
    `)
    await queryInterface.addColumn('feedback_summary_cache', 'course_realisation_start_date', {
      type: DATEONLY,
      allowNull: false,
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('feedback_summary_cache', 'course_realisation_start_date')
  },
}
