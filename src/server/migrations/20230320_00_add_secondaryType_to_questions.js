const { DataTypes } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('questions', 'secondary_type', {
      type: DataTypes.STRING,
      allowNull: true,
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.dropColumn('questions', 'secondary_type')
  },
}
