const { DataTypes } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('user_feedback_targets', 'group_ids', {
      type: DataTypes.ARRAY(DataTypes.STRING),
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.dropColumn('user_feedback_targets', 'group_ids')
  },
}
