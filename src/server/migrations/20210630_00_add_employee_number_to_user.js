const { STRING } = require('sequelize')

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addColumn('users', 'employee_number', {
      type: STRING,
    })
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('users', 'employee_number')
  },
}
