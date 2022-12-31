const { INTEGER } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.changeColumn('surveys', 'feedback_target_id', {
      type: INTEGER,
      allowNull: true,
    })
  },
  down: async () => {},
}
