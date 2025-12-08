module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('feedbacks', 'survey_id')
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('feedbacks', 'survey_id')
  },
}
