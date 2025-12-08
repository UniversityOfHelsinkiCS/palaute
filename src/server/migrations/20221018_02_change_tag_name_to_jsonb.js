const { STRING } = require('sequelize')
const { JSONB } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('tags', 'name')
    await queryInterface.addColumn('tags', 'name', {
      type: JSONB,
      allowNull: false,
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('tags', 'name')
    await queryInterface.addColumn('tags', 'name', {
      type: STRING,
      allowNull: false,
    })
  },
}
