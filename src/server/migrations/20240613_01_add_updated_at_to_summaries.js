const { DATE, ENUM } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('summaries', 'updated_at', { type: DATE })
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('summaries', 'updated_at')
  },
}
