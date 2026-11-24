const { INTEGER } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    for (const table of ['surveys', 'standalone_surveys']) {
      await queryInterface.addColumn(table, 'questions_version', { type: INTEGER, allowNull: false, defaultValue: 0 })
    }
  },
  down: async queryInterface => {
    for (const table of ['surveys', 'standalone_surveys']) {
      await queryInterface.removeColumn(table, 'questions_version')
    }
  },
}
