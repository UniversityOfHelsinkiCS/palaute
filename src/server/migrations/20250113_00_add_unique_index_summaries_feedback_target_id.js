module.exports = {
  up: async queryInterface => {
    await queryInterface.addIndex('summaries', {
      unique: true,
      fields: ['feedback_target_id'],
    })
  },
  down: async queryInterface => {},
}
