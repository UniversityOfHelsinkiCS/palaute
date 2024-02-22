const { STRING } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('course_units', 'group_id', {
      type: STRING,
      allowNull: true,
    })
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('course_units', 'group_id')
  },
}
