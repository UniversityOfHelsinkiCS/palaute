const { DATE } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.sequelize.transaction(async t => {
      await queryInterface.addColumn('surveys', 'valid_from', { type: DATE, allowNull: true }, { transaction: t })
    })
  },

  down: async queryInterface => {
    await queryInterface.sequelize.transaction(async t => {
      await queryInterface.removeColumn('surveys', 'valid_from', { transaction: t })
    })
  },
}
