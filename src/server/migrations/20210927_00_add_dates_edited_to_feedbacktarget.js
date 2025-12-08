const { BOOLEAN } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('feedback_targets', 'feedback_dates_edited_by_teacher', {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('feedback_targets', 'feedback_dates_edited_by_teacher')
  },
}
