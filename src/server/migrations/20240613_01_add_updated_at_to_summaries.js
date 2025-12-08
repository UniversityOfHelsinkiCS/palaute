const { DATE, ENUM } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('summaries', 'updated_at', { type: DATE })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('summaries', 'updated_at')
  },
}
