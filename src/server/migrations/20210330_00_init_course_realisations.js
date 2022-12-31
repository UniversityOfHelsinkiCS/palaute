const { DATE, STRING, JSONB } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.createTable('course_realisations', {
      id: {
        type: STRING,
        primaryKey: true,
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
      end_date: {
        type: DATE,
        allowNull: false,
      },
      name: {
        type: JSONB,
        allowNull: false,
      },
    })
  },
  down: async queryInterface => {
    await queryInterface.dropTable('course_realisations')
  },
}
