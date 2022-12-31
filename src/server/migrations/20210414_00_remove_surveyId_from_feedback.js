module.exports = {
  up: async queryInterface => {
    await queryInterface.removeColumn('feedbacks', 'survey_id')
  },
  down: async queryInterface => {
    await queryInterface.addColumn('feedbacks', 'survey_id')
  },
}
