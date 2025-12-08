module.exports = {
  up: async ({ context: queryInterface }) => {
    try {
      await queryInterface.removeColumn('feedback_targets', 'feedback_count')
    } catch {}
  },
}
