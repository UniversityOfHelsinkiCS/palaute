const { STRING } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('course_realisations', 'educational_institution_urn', {
      type: STRING,
      allowNull: true,
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('course_realisations', 'educational_institution_urn')
  },
}
