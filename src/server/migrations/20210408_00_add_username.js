const { STRING } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('users', 'username', {
      type: STRING,
      allowNull: false,
      defaultValue: 'user',
    })
    await queryInterface.sequelize.query('UPDATE users SET username=id')
    await queryInterface.changeColumn('users', 'username', {
      type: STRING,
      allowNull: false,
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('users', 'username')
  },
}
