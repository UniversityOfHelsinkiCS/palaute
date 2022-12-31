const { TEXT } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('continuous_feedbacks', 'response', {
      type: TEXT,
    })
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('continuous_feedbacks', 'response')
  },
}
