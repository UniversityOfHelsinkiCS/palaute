const { DATE, ENUM } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('summaries', 'entity_type', {
      type: ENUM,
      values: ['feedbackTarget', 'courseRealisation', 'courseUnit', 'courseUnitGroup', 'tag', 'organisation'],
      allowNull: true,
    })
    await queryInterface.addColumn('summaries', 'created_at', { type: DATE })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('summaries', 'entity_type')
    await queryInterface.removeColumn('summaries', 'created_at')
    await queryInterface.sequelize.query('DROP TYPE enum_summaries_entity_type')
  },
}
