const { JSONB } = require('sequelize')

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.removeColumn('surveys', 'data')
  },
  down: async (queryInterface) => {
    await queryInterface.addColumn('surveys', 'data', {
      type: JSONB,
    })
  },
}
