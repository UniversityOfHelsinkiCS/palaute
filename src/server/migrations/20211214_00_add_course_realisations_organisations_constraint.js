module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addConstraint('course_realisations_organisations', {
      fields: ['course_realisation_id', 'organisation_id'],
      type: 'unique',
      name: 'course_realisation_organisation',
    })
  },
  down: async (queryInterface) => {
    await queryInterface.removeConstraint('course_realisations_organisations')
  },
}
