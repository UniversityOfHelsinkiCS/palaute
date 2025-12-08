const { INTEGER } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('questions', 'course_realisation_id')
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('questions', 'course_realisation_id', {
      type: INTEGER,
    })
  },
}
