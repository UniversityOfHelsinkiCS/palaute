const { STRING, ARRAY } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('course_units', 'primary_organisation_id', {
      type: STRING,
    })
    await queryInterface.addColumn('course_units', 'organisation_ids', {
      type: ARRAY(STRING),
    })
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('course_units', 'primary_organisation_id')
    await queryInterface.removeColumn('course_units', 'organisation_ids')
  },
}
