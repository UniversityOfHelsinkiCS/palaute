const { BOOLEAN } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('organisation_feedback_correspondents', 'user_created', {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    })

    // Set all existing rows to have user_created = true
    await queryInterface.sequelize.query('UPDATE organisation_feedback_correspondents SET user_created = TRUE')
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('organisation_feedback_correspondents', 'user_created')
  },
}
