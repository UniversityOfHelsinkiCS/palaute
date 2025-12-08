const { ARRAY, TEXT } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    try {
      await queryInterface.addColumn('organisations', 'student_list_visible_course_codes', {
        type: ARRAY(TEXT),
        allowNull: false,
        defaultValue: [],
      })
    } catch (error) {
      console.log('student list visible course codes already hopefully existed')
    }
  },
  down: async ({ context: queryInterface }) => {
    try {
      await queryInterface.removeColumn('organisations', 'student_list_visible_course_codes')
    } catch (error) {
      console.log('student list visible course codes hopefully did not exist')
    }
  },
}
