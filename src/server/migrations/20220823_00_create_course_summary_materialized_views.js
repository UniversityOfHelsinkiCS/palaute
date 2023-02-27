const { initialiseSummaryView, initialiseCountsView } = require('../services/summary/sql')

module.exports = {
  up: async () => {
    await initialiseSummaryView()
    await initialiseCountsView()
  },
  down: async queryInterface => {
    await queryInterface.sequelize.query('DROP course_results_view')
    await queryInterface.sequelize.query('DROP feedback_targets_counts_view')
  },
}
