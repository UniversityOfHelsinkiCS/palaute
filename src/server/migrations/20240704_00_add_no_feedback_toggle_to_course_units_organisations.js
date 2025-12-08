const { BOOLEAN } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('course_units_organisations', 'no_feedback_allowed', { type: BOOLEAN })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('course_units_organisations', 'no_feedback_allowed')
  },
}
