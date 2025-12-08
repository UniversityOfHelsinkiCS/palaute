const { STRING, ARRAY } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('course_units', 'primary_organisation_id')
    await queryInterface.removeColumn('course_units', 'organisation_ids')
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('course_units', 'primary_organisation_id', {
      type: STRING,
    })
    await queryInterface.addColumn('course_units', 'organisation_ids', {
      type: ARRAY(STRING),
    })
  },
}
