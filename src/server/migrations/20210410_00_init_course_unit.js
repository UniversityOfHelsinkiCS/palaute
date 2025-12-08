const { STRING, DATE, JSONB } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable('course_units', {
      id: {
        type: STRING,
        primaryKey: true,
        allowNull: false,
      },
      name: {
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
  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('course_units')
  },
}
