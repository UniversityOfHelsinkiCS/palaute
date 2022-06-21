const { ARRAY, TEXT } = require('sequelize')

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addColumn('organisations', 'student_list_visible_course_codes', {
      type: ARRAY(TEXT),
      allowNull: false,
      defaultValue: [],
    })
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('organisations', 'student_list_visible_course_codes')
  },
}
