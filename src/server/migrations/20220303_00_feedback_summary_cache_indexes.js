module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addIndex('feedback_summary_cache', {
      fields: ['organisation_id'],
      name: 'feedback_summary_cache_organisation_id',
    })
    await queryInterface.addIndex('feedback_summary_cache', {
      fields: ['course_realisation_id'],
      name: 'feedback_summary_cache_course_realisation_id',
    })
  },
  down: async (queryInterface) => {
    await queryInterface.removeIndex('feedback_summary_cache_organisation_id')
    await queryInterface.removeIndex(
      'feedback_summary_cache_course_realisation_id',
    )
  },
}
