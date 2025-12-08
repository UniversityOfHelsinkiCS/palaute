module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addConstraint('user_feedback_targets', {
      fields: ['user_id', 'feedback_target_id'],
      type: 'unique',
      name: 'user_feedback_target',
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeConstraint('user_feedback_targets')
  },
}
