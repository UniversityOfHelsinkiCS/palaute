const { STRING } = require('sequelize')

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addColumn('feedbacks', 'user_id', {
      type: STRING,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    })
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('feedbacks', 'user_id')
  },
}
