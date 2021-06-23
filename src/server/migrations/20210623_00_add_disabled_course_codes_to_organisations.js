const { ARRAY, TEXT } = require('sequelize')

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addColumn('organisations', 'disabled_course_codes', {
      type: ARRAY(TEXT),
      allowNull: false,
      defaultValue: [],
    })
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('organisations', 'disabled_course_codes')
  },
}
