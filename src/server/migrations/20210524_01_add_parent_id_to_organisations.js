const { STRING } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('organisations', 'parent_id', {
      type: STRING,
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('organisations', 'parent_id')
  },
}
