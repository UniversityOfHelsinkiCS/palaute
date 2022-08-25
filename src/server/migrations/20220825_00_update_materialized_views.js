const {
  SUMMARY_VIEW_QUERY,
  COUNTS_VIEW_QUERY,
} = require('../routes/courseSummary/sql')

module.exports = {
  up: async (queryInterface) => {
    try {
      await queryInterface.sequelize.query(
        'DROP MATERIALIZED VIEW course_results_view',
      )
    } catch (e) {
      console.log(
        "course_results_view doesn't exist but its fine, creating it now",
      )
    }
    await queryInterface.sequelize.query(SUMMARY_VIEW_QUERY)
    try {
      await queryInterface.sequelize.query(
        'DROP MATERIALIZED VIEW feedback_targets_counts_view',
      )
    } catch (e) {
      console.log(
        "feedback_targets_counts_view doesn't exist but its fine, creating it now",
      )
    }
    await queryInterface.sequelize.query(COUNTS_VIEW_QUERY)
  },
  down: async (queryInterface) => {},
}
