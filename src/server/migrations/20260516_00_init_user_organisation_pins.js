const { STRING, DATE, INTEGER } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable(
        'user_organisation_pins',
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
      await queryInterface.addIndex('user_organisation_pins', ['user_id', 'organisation_id'], {
        unique: true,
        transaction,
      })
    })
  },
  down: async queryInterface => {
    await queryInterface.dropTable('user_organisation_pins')
  },
}
