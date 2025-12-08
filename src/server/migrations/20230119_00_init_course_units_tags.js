const { STRING, DATE, INTEGER } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable(
        'course_units_tags',
        {
          id: {
            type: INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
          },
          course_unit_id: {
            type: STRING,
            references: { model: 'course_units', key: 'id' },
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
    await queryInterface.dropTable('course_units_tags')
  },
}
