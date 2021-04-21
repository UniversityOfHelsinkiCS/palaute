const { BOOLEAN } = require('sequelize')

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addColumn('questions', 'required', {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: true,
    })
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('questions', 'required')
  },
}
