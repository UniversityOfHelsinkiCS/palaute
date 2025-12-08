const { BOOLEAN } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('questions', 'required', {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: true,
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('questions', 'required')
  },
}
