const { JSONB } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('course_realisations', 'teaching_languages', {
      type: JSONB,
      allowNull: true,
      defaultValue: null,
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('course_realisations', 'teaching_languages')
  },
}
