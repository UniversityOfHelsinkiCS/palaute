const { ARRAY, TEXT } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('organisations', 'disabled_course_codes', {
      type: ARRAY(TEXT),
      allowNull: false,
      defaultValue: [],
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('organisations', 'disabled_course_codes')
  },
}
