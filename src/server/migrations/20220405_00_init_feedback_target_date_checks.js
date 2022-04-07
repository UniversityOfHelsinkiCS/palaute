const { DATE, INTEGER, NOW, STRING, BOOLEAN } = require('sequelize')

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('feedback_target_date_checks', {
      id: {
        type: INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      feedback_target_id: {
        type: INTEGER,
        unique: true,
        references: { model: 'feedback_targets', key: 'id' },
        allowNull: false,
      },
      is_solved: {
        type: BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: DATE,
        allowNull: false,
      },
      updated_at: {
        type: DATE,
        allowNull: true,
      },
    })
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('feedback_target_date_checks')
  },
}
