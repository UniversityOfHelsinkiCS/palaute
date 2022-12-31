const { STRING, JSONB, INTEGER } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.dropTable('feedback_summary_cache')
  },
  down: async queryInterface => {
    await queryInterface.createTable('feedback_summary_cache', {
      id: {
        type: INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      course_realisation_id: {
        type: STRING,
        allowNull: false,
      },
      organisation_id: {
        type: STRING,
        allowNull: false,
      },
      data: {
        type: JSONB,
        allowNull: false,
      },
    })
  },
}
