const { STRING, DATE, INTEGER, JSONB } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable('feedback_target_logs', {
      id: {
        type: INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      data: {
        type: JSONB,
        allowNull: false,
      },
      feedback_target_id: {
        type: INTEGER,
        references: { model: 'feedback_targets', key: 'id' },
        allowNull: false,
      },
      user_id: {
        type: STRING,
        references: { model: 'users', key: 'id' },
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
  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('feedback_target_logs')
  },
}
