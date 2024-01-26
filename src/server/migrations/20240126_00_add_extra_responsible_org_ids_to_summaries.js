const { STRING, ARRAY } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.removeIndex('summaries', 'summaries_entity_id_start_date_end_date')
    await queryInterface.addColumn('summaries', 'extra_responsible_org_ids', {
      type: ARRAY(STRING),
    })
    await queryInterface.addIndex('summaries', {
      fields: ['entity_id', 'start_date', 'end_date'],
    })
  },
  down: async queryInterface => {},
}
