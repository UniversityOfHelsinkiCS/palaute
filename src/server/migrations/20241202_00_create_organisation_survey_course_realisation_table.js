const { DataTypes } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.createTable('organisationSurveyCourses', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      feedbackTargetId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      courseRealisationId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userFeedbackTargetId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    })
  },
  down: async queryInterface => {
    await queryInterface.dropTable('organisationSurveyCourses')
  },
}
