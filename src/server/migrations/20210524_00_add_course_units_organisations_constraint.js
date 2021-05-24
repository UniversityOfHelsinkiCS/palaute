module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addConstraint('course_units_organisations', {
      fields: ['course_unit_id', 'organisation_id'],
      type: 'unique',
      name: 'course_unit_organisation',
    })
  },
  down: async (queryInterface) => {
    await queryInterface.removeConstraint('course_units_organisations')
  },
}
