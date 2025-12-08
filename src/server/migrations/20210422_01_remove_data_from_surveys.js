const { JSONB } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('surveys', 'data')
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('surveys', 'data', {
      type: JSONB,
    })
  },
}
