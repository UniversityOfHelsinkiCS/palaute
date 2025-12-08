module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addIndex('course_units', {
      fields: ['course_code'],
      name: 'course_units_course_code',
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeIndex('course_units_course_code')
  },
}
