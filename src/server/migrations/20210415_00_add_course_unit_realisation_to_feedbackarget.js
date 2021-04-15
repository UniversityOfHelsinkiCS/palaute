const { STRING } = require('sequelize')

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addColumn(
      'feedback_targets',
      'course_unit_realisation_id',
      {
        type: STRING,
        allowNull: false,
      },
    )
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn(
      'feedback_targets',
      'course_unit_realisation_id',
    )
  },
}
