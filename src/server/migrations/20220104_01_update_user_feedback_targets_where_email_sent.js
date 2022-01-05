module.exports = {
  up: async (queryInterface) => {
    const [id] = await queryInterface.sequelize.query(
      `SELECT u.id FROM user_feedback_targets u 
        INNER JOIN feedback_targets f on u.feedback_target_id = f.id 
        WHERE f.feedback_open_notification_email_sent = true`,
    )

    const ids = id.map((i) => i.id)

    ids.push(0)

    await queryInterface.sequelize.query(
      `UPDATE user_feedback_targets SET feedback_open_email_sent = true WHERE id in (${ids})`,
    )
  },
  down: async (queryInterface) => {
    const [id] = await queryInterface.sequelize.query(
      `SELECT u.id FROM user_feedback_targets u 
          INNER JOIN feedback_targets f on u.feedback_target_id = f.id 
          WHERE f.feedback_open_notification_email_sent = true`,
    )

    const ids = id.map((i) => i.id)

    await queryInterface.sequelize.query(
      `UPDATE user_feedback_targets SET feedback_open_email_sent = false WHERE id in (${ids})`,
    )
  },
}
