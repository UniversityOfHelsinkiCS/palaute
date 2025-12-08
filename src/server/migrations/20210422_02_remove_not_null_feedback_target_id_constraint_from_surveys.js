const { INTEGER } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.changeColumn('surveys', 'feedback_target_id', {
      type: INTEGER,
      allowNull: true,
    })
  },
  down: async () => {},
}
