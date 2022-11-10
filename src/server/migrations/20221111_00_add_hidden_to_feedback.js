const { BOOLEAN } = require('sequelize')

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addColumn('feedbacks', 'hidden', {
      type: BOOLEAN,
      defaultValue: false,
    })
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('feedbacks', 'hidden')
  },
}
