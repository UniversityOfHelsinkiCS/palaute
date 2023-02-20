const { SUMMARY_VIEW_QUERY, COUNTS_VIEW_QUERY } = require('../services/summary/sql')
const { OPEN_UNIVERSITY_ORG_ID } = require('../util/config')

module.exports = {
  up: async queryInterface => {
    await queryInterface.sequelize.query(SUMMARY_VIEW_QUERY, {
      replacements: { openUniversityOrgId: OPEN_UNIVERSITY_ORG_ID },
    })
    await queryInterface.sequelize.query(COUNTS_VIEW_QUERY)
  },
  down: async queryInterface => {
    await queryInterface.sequelize.query('DROP course_results_view')
    await queryInterface.sequelize.query('DROP feedback_targets_counts_view')
  },
}
