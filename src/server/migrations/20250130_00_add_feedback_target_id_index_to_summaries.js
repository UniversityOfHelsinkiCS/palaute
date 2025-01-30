module.exports = {
  up: async queryInterface => {
    await queryInterface.addIndex('summaries', {
      fields: ['feedback_target_id'],
      name: 'summaries_feedback_target_id',
    })
  },
  down: async queryInterface => {
    await queryInterface.removeIndex('summaries_feedback_target_id')
  },
}
