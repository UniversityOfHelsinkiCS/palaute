const { STRING, DATE, INTEGER } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable(
        'organisation_feedback_correspondents',
        {
          id: {
            type: INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
          },
          user_id: {
            type: STRING,
            references: { model: 'users', key: 'id' },
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
        },
        { transaction }
      )
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('organisation_feedback_correspondents')
  },
}
