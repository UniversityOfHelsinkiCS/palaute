const { INTEGER, DATE, STRING, BOOLEAN, JSONB } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.createTable('questions', {
      id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      type: {
        type: STRING,
        allowNull: false,
      },
      required: {
        type: BOOLEAN,
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
  down: async queryInterface => {
    await queryInterface.dropTable('questions')
  },
}
