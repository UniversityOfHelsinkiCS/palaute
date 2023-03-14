module.exports = {
  up: async () => {
    try {
      const { initialiseSummaryView, initialiseCountsView } = require('../services/summary/sql')
      await initialiseSummaryView()
      await initialiseCountsView()
    } catch (error) {
      console.error('Failed to initialize summary mat views: ', error?.message)
    }
  },
  down: async queryInterface => {
    await queryInterface.sequelize.query('DROP course_results_view')
    await queryInterface.sequelize.query('DROP feedback_targets_counts_view')
  },
}
