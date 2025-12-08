const { STRING, DATE, INTEGER } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
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
      feedback_id: {
        type: INTEGER,
        references: { model: 'feedbacks', key: 'id' },
      },
      user_id: {
        type: STRING,
        allowNull: false,
        references: { model: 'users', key: 'id' },
      },
      feedback_target_id: {
        type: INTEGER,
        allowNull: false,
        references: { model: 'feedback_targets', key: 'id' },
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
  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('user_feedback_targets')
  },
}
