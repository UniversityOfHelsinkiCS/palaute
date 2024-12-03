const { DataTypes } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.createTable('organisation_survey_courses', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      feedback_target_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      course_realisation_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_feedback_target_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    })
  },
  down: async queryInterface => {
    await queryInterface.dropTable('organisation_survey_courses')
  },
}
