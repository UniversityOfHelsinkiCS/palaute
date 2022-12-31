const { STRING } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('users', 'student_number', {
      type: STRING,
    })
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('users', 'student_number')
  },
}
