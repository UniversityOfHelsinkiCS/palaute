module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addIndex('feedback_targets', {
      fields: ['course_realisation_id'],
      name: 'feedback_targets_course_realisation_id',
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeIndex('feedback_targets_course_realisation_id')
  },
}
