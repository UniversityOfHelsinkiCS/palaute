const { STRING, DATE, INTEGER } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable('course_realisations_organisations', {
      id: {
        type: INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      type: {
        type: STRING,
        allowNull: false,
      },
      course_realisation_id: {
        type: STRING,
        references: { model: 'course_realisations', key: 'id' },
        allowNull: false,
      },
      organisation_id: {
        type: STRING,
        references: { model: 'organisations', key: 'id' },
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
    await queryInterface.dropTable('course_realisations_organisations')
  },
}
