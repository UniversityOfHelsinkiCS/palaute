const { DATE, STRING, JSONB, BOOLEAN } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable('inactive_course_realisations', {
      id: {
        type: STRING,
        primaryKey: true,
        allowNull: false,
      },
      end_date: {
        type: DATE,
        allowNull: false,
      },
      start_date: {
        type: DATE,
        allowNull: false,
      },
      name: {
        type: JSONB,
        allowNull: false,
      },
      educational_institution_urn: {
        type: STRING,
        allowNull: true,
      },
      is_mooc_course: {
        type: BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      teaching_languages: {
        type: JSONB,
        allowNull: true,
        defaultValue: null,
      },
      manually_enabled: {
        type: BOOLEAN,
        defaultValue: false,
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
    await queryInterface.dropTable('inactive_course_realisations')
  },
}
