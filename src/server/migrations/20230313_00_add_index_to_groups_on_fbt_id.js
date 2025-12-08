module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addIndex('groups', {
      fields: ['feedback_target_id'],
      name: 'groups_feedback_target_id',
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeIndex('groups')
  },
}
