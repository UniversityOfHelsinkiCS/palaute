const { STRING, DATE, INTEGER, JSONB } = require('sequelize')

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('summary_customisations', {
      id: {
        type: INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      user_id: {
        type: STRING,
        references: { model: 'users', key: 'id' },
        allowNull: false,
      },
      data: {
        type: JSONB,
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
    await queryInterface.dropTable('summary_customisations')
  },
}
