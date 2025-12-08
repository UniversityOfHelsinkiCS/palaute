const { STRING } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('feedbacks', 'survey_id', {
      type: STRING,
      allowNull: false,
      defaultValue: 'id',
    })
    await queryInterface.sequelize.query('UPDATE feedbacks SET survey_id=course_realisation_id')
    await queryInterface.changeColumn('feedbacks', 'survey_id', {
      type: STRING,
      allowNull: false,
    })
    await queryInterface.removeColumn('feedbacks', 'course_realisation_id')
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('feedbacks', 'course_realisation_id')
    await queryInterface.removeColumn('feedbacks', 'survey_id')
  },
}
