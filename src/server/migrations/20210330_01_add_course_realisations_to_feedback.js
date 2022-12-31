const { STRING } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('feedbacks', 'course_realisation_id', {
      type: STRING,
      allowNull: false,
      references: { model: 'course_realisations', key: 'id' },
    })
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('feedbacks', 'course_realisation_id')
  },
}
