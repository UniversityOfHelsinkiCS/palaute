module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addConstraint('course_realisations_organisations', {
      fields: ['course_realisation_id', 'organisation_id'],
      type: 'unique',
      name: 'course_realisation_organisation',
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeConstraint('course_realisations_organisations')
  },
}
