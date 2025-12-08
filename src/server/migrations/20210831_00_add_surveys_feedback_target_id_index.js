module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addIndex('surveys', {
      fields: ['feedback_target_id'],
      name: 'surveys_feedback_target_id',
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeIndex('surveys_feedback_target_id')
  },
}
