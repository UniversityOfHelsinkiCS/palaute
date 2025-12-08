const { STRING } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('organisations', 'responsible_user_id', {
      type: STRING,
      references: { model: 'users', key: 'id' },
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('organisations', 'responsible_user_id')
  },
}
