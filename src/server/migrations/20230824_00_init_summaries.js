const { DataTypes } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.createTable(
      'summaries',
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        entity_id: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        start_date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        end_date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        data: {
          type: DataTypes.JSONB,
          allowNull: false,
        },
      },
      {
        unlogged: true,
      }
    )
  },
  down: async queryInterface => {
    await queryInterface.dropTable('summaries')
  },
}
