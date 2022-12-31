const { STRING } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('users', 'secondary_email', {
      type: STRING,
      allowNull: true,
    })
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('users', 'secondary_email')
  },
}
