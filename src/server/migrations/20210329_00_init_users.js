const { DATE, STRING } = require('sequelize')

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('users', {
      id: {
        type: STRING,
        primaryKey: true,
        allowNull: false,
      },
      first_name: {
        type: STRING,
      },
      last_name: {
        type: STRING,
      },
      email: {
        type: STRING,
      },
      created_at: {
        type: DATE,
        allowNull: false,
      },
      updated_at: {
        type: DATE,
        allowNull: false,
      },
    })
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('users')
  },
}
