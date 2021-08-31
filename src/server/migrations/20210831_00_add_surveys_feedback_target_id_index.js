module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addIndex('surveys', {
      fields: ['feedback_target_id'],
      name: 'surveys_feedback_target_id',
    })
  },
  down: async (queryInterface) => {
    await queryInterface.removeIndex('surveys_feedback_target_id')
  },
}
