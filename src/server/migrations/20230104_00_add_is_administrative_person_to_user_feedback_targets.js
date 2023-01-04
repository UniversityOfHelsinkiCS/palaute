const { BOOLEAN } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('user_feedback_targets', 'is_administrative_person', {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    })
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('user_feedback_targets', 'is_administrative_person')
  },
}
