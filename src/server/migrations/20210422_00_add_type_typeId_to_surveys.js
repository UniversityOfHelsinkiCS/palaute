const { STRING, ENUM } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('surveys', 'type', {
      type: ENUM,
      values: ['feedbackTarget', 'programme', 'university'],
      defaultValue: 'feedbackTarget',
      allowNull: false,
    })
    await queryInterface.addColumn('surveys', 'type_id', { type: STRING })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('surveys', 'type')
    await queryInterface.removeColumn('surveys', 'type_id')
    await queryInterface.sequelize.query('DROP TYPE enum_surveys_type')
  },
}
