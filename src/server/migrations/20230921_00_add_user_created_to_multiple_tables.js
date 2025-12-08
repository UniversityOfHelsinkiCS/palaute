const { BOOLEAN } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('feedback_targets', 'user_created', {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    })
    await queryInterface.addColumn('user_feedback_targets', 'user_created', {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    })
    await queryInterface.addColumn('course_realisations', 'user_created', {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    })
    await queryInterface.addColumn('course_units', 'user_created', {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.dropColumn('feedback_targets', 'user_created')
    await queryInterface.dropColumn('user_feedback_targets', 'user_created')
    await queryInterface.dropColumn('course_realisations', 'user_created')
    await queryInterface.dropColumn('course_units', 'user_created')
  },
}
