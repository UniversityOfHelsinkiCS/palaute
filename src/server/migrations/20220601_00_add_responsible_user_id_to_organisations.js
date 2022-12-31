const { STRING } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('organisations', 'responsible_user_id', {
      type: STRING,
      references: { model: 'users', key: 'id' },
    })
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('organisations', 'responsible_user_id')
  },
}
