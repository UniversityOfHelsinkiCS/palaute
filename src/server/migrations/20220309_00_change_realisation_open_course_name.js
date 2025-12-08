const { BOOLEAN } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('course_realisations', 'is_open_course')
    await queryInterface.addColumn('course_realisations', 'is_mooc_course', {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('course_realisations', 'is_mooc_course')
    await queryInterface.addColumn('course_realisations', 'is_open_course', {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    })
  },
}
