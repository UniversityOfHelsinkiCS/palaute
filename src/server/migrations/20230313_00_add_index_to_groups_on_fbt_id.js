module.exports = {
  up: async queryInterface => {
    await queryInterface.addIndex('groups', {
      fields: ['feedback_target_id'],
      name: 'groups_feedback_target_id',
    })
  },
  down: async queryInterface => {
    await queryInterface.removeIndex('groups')
  },
}
