const { ENUM } = require('sequelize')
const { JSONB } = require('sequelize')
const { DATE, INTEGER } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable(
        'banners',
        {
          id: {
            type: INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
          },
          data: {
            type: JSONB,
            allowNull: false,
          },
          access_group: {
            type: ENUM,
            values: ['STUDENT', 'TEACHER', 'ORG', 'ADMIN'],
          },
          start_date: {
            type: DATE,
            allowNull: false,
          },
          end_date: {
            type: DATE,
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
    await queryInterface.dropTable('tags')
  },
}
