const { STRING } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('questions', 'course_realisation_id', {
      type: STRING,
      allowNull: false,
      references: { model: 'course_realisations', key: 'id' },
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('questions', 'course_realisation_id')
  },
}
