module.exports = {
  up: async queryInterface => {
    await queryInterface.sequelize.query(`
      WITH feedback_counts as (
        SELECT feedback_target_id as id, count(*) as c
        FROM user_feedback_targets
        WHERE feedback_id IS NOT NULL
        GROUP BY feedback_target_id
      ) 
      UPDATE feedback_targets
      SET feedback_count = feedback_counts.c
      FROM feedback_counts
      WHERE feedback_targets.id = feedback_counts.id
    `)
  },
}
