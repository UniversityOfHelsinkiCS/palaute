const { ARRAY, INTEGER } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('feedback_targets', 'public_question_ids', {
      type: ARRAY(INTEGER),
      allowNull: false,
      defaultValue: [],
    })
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('feedback_targets', 'public_question_ids')
  },
}
