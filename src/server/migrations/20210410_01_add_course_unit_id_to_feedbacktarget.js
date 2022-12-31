const { STRING } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('feedback_targets', 'course_unit_id', {
      type: STRING,
      allowNull: false,
      references: { model: 'course_units', key: 'id' },
    })
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('feedback_targets', 'course_unit_id')
  },
}
