module.exports = {
  up: async queryInterface => {
    await queryInterface.addIndex('feedback_targets', {
      fields: ['course_realisation_id'],
      name: 'feedback_targets_course_realisation_id',
    })
  },
  down: async queryInterface => {
    await queryInterface.removeIndex('feedback_targets_course_realisation_id')
  },
}
