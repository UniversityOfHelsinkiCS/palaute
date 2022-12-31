const { STRING } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('organisations', 'parent_id', {
      type: STRING,
    })
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('organisations', 'parent_id')
  },
}
