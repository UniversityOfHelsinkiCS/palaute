const { STRING } = require('sequelize')
const { CourseRealisation } = require('../models')

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addColumn(
      'feedback_targets',
      'course_realisation_id',
      {
        type: STRING,
        allowNull: false,
        references: { model: CourseRealisation, key: 'id' },
      },
    )
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn(
      'feedback_targets',
      'course_realisation_id',
    )
  },
}
