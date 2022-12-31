const { STRING, DATE, JSONB } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.createTable('organisations', {
      id: {
        type: STRING,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: JSONB,
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
  down: async queryInterface => {
    await queryInterface.dropTable('organisations')
  },
}
