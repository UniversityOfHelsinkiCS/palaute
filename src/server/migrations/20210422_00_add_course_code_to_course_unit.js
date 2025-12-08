const { STRING, JSONB } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('course_units', 'course_code', {
      type: STRING,
    })
    await queryInterface.addColumn('course_units', 'validity_period', {
      type: JSONB,
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('course_units', 'course_code')
    await queryInterface.removeColumn('course_units', 'validity_period')
  },
}
