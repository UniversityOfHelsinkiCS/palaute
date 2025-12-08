const { DATE, STRING, JSONB } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('assessment_items')
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.createTable('assessment_items', {
      id: {
        type: STRING,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: JSONB,
        allowNull: false,
      },
      name_specifier: {
        type: JSONB,
        allowNull: false,
      },
      assessment_item_type: {
        type: STRING,
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
}
