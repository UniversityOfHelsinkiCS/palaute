const { ARRAY, INTEGER } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('surveys', 'question_ids', {
      type: ARRAY(INTEGER),
      allowNull: false,
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('surveys', 'question_ids')
  },
}
