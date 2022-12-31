module.exports = {
  up: async queryInterface => {
    await queryInterface.addIndex('feedback_targets', {
      fields: ['course_unit_id'],
      name: 'feedback_targets_course_unit_id',
    })
  },
  down: async queryInterface => {
    await queryInterface.removeIndex('feedback_targets_course_unit_id')
  },
}
