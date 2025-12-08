const { ARRAY, INTEGER } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('feedback_targets', 'public_question_ids', {
      type: ARRAY(INTEGER),
      allowNull: false,
      defaultValue: [],
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('feedback_targets', 'public_question_ids')
  },
}
