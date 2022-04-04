const { JSONB } = require('sequelize')

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addColumn(
      'course_realisations',
      'teaching_languages',
      {
        type: JSONB,
        allowNull: true,
        defaultValue: null,
      },
    )
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn(
      'course_realisations',
      'teaching_languages',
    )
  },
}
