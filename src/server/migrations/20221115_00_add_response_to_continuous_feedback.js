const { TEXT } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('continuous_feedbacks', 'response', {
      type: TEXT,
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('continuous_feedbacks', 'response')
  },
}
