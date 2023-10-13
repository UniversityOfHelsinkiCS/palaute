const { DataTypes } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.removeIndex('summaries', 'summaries_entity_id_start_date_key')
    await queryInterface.addIndex('summaries', {
      unique: true,
      fields: ['entity_id', 'start_date', 'end_date'],
    })
    await queryInterface.sequelize.query('ALTER TABLE summaries SET UNLOGGED')
  },
  down: async queryInterface => {
    await queryInterface.destroyIndex('summaries_entity_id_start_date_end_date_key')
  },
}
