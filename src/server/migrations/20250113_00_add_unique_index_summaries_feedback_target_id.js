module.exports = {
  up: async queryInterface => {
    await queryInterface.sequelize.query('DELETE FROM summaries WHERE feedback_target_id IS NOT NULL')
    await queryInterface.addIndex('summaries', {
      unique: true,
      fields: ['feedback_target_id'],
    })
  },
  down: async queryInterface => {},
}
