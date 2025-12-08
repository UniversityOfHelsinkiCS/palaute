const { STRING, DATE, INTEGER, JSONB, BOOLEAN } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable('norppa_feedbacks', {
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
      user_id: {
        type: STRING,
        references: { model: 'users', key: 'id' },
        allowNull: false,
      },
      response_wanted: {
        type: BOOLEAN,
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
    await queryInterface.dropTable('norppa_feedbacks')
  },
}
