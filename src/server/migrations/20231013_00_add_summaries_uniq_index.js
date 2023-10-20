const { DataTypes } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addIndex('summaries', {
      unique: true,
      fields: ['entity_id', 'start_date', 'end_date'],
    })
    await queryInterface.sequelize.query('ALTER TABLE summaries SET UNLOGGED')
  },
  down: async queryInterface => {},
}
