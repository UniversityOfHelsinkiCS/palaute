const { STRING } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    queryInterface.changeColumn('norppa_feedbacks', 'user_id', {
      type: STRING,
      allowNull: true,
    })
  },
  down: async ({ context: queryInterface }) => {
    queryInterface.changeColumn('norppa_feedbacks', 'user_id', {
      type: STRING,
      allowNull: false,
    })
  },
}
