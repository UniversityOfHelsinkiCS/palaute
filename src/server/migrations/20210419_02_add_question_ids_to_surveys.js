const { ARRAY, INTEGER } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('surveys', 'question_ids', {
      type: ARRAY(INTEGER),
      allowNull: false,
    })
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('surveys', 'question_ids')
  },
}
