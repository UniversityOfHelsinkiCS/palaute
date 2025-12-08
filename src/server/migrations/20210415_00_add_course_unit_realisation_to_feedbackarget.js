const { STRING } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('feedback_targets', 'course_realisation_id', {
      type: STRING,
      allowNull: false,
      references: { model: 'course_realisations', key: 'id' },
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('feedback_targets', 'course_realisation_id')
  },
}
