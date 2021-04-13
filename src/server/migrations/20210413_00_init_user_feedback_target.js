const { STRING, DATE, INTEGER } = require('sequelize')

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('user_feedback_targets', {
      id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      access_status: {
        type: STRING,
        allowNull: false,
      },
      feedback_id: INTEGER,
      user_id: {
        type: STRING,
        allowNull: false,
      },
      feedback_target_id: {
        type: INTEGER,
        allowNull: false,
      },
      created_at: {
        type: DATE,
        allowNull: false,
      },
      updated_at: {
        type: DATE,
        allowNull: false,
      },
    })
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('user_feedback_targets')
  },
}
