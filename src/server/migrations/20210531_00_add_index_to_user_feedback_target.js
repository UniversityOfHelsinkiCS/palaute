module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addIndex('user_feedback_targets', {
      fields: ['user_id', 'access_status'],
      name: 'user_feedback_target_status',
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeIndex('user_feedback_target_status')
  },
}
