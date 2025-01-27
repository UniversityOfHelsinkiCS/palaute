module.exports = {
  up: async queryInterface => {
    try {
      await queryInterface.removeColumn('feedback_targets', 'feedback_count')
    } catch {}
  },
}
