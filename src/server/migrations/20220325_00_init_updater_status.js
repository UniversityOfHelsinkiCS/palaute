const { DATE, INTEGER, NOW, STRING } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable('updater_statuses', {
      id: {
        type: INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      started_at: {
        type: DATE,
        defaultValue: NOW,
        allowNull: false,
      },
      finished_at: {
        type: DATE,
        allowNull: true,
      },
      status: {
        type: STRING(16),
        allowNull: false,
      },
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('updater_statuses')
  },
}
