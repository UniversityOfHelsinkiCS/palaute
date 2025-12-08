const { STRING, DATE, INTEGER } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable(
        'tags',
        {
          id: {
            type: INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
          },
          organisation_id: {
            type: STRING,
            references: { model: 'organisations', key: 'id' },
            allowNull: false,
          },
          name: {
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
        },
        { transaction }
      )

      await queryInterface.createTable(
        'course_realisations_tags',
        {
          id: {
            type: INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
          },
          course_realisation_id: {
            type: STRING,
            references: { model: 'course_realisations', key: 'id' },
            allowNull: false,
          },
          tag_id: {
            type: INTEGER,
            references: { model: 'tags', key: 'id' },
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
        },
        { transaction }
      )
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('course_realisations_tags')
    await queryInterface.dropTable('tags')
  },
}
