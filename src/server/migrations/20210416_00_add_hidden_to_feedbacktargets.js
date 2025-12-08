const { BOOLEAN } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('feedback_targets', 'hidden', {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: true,
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('feedback_targets', 'hidden')
  },
}
