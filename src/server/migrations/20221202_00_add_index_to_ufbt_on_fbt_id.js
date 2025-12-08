module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`
      CREATE INDEX user_feedback_targets_feedback_target_id
      ON user_feedback_targets (feedback_target_id);
    `)
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`
      DROP INDEX user_feedback_targets_feedback_target_id;
    `)
  },
}
