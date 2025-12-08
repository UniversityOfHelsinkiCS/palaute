const { STRING, DATE, INTEGER } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.transaction(async transaction => {
      try {
        await queryInterface.dropTable('course_units_tags')
      } catch (error) {
        console.log(
          "CU tags didn't exist (delete this logic and old migration once production and all dev machines are migrated)"
        )
      }

      await queryInterface.createTable(
        'course_units_tags',
        {
          id: {
            type: INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
          },
          course_code: {
            type: STRING,
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
