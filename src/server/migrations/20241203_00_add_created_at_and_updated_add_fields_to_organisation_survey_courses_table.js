const { DATE } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('organisation_survey_courses', 'created_at', {
      type: DATE,
      allowNull: false,
    })
    await queryInterface.addColumn('organisation_survey_courses', 'updated_at', {
      type: DATE,
      allowNull: false,
    })
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('organisation_survey_courses', 'created_at')
    await queryInterface.removeColumn('organisation_survey_courses', 'updated_at')
  },
}
