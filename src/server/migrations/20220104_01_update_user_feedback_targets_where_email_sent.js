const { BOOLEAN } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    const [id] = await queryInterface.sequelize.query(
      `SELECT u.id FROM user_feedback_targets u 
        INNER JOIN feedback_targets f on u.feedback_target_id = f.id 
        WHERE f.feedback_open_notification_email_sent = true`
    )

    const ids = id.map(i => i.id)

    ids.push(0)

    await queryInterface.sequelize.query(
      `UPDATE user_feedback_targets SET feedback_open_email_sent = true WHERE id in (${ids})`
    )

    await queryInterface.removeColumn('feedback_targets', 'feedback_open_notification_email_sent')
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('feedback_targets', 'feedback_open_notification_email_sent', { type: BOOLEAN })

    const [id] = await queryInterface.sequelize.query(
      `SELECT distinct(f.id) FROM feedback_targets f 
       INNER JOIN user_feedback_targets u on f.id = u.feedback_target_id 
       WHERE u.feedback_open_email_sent = true`
    )

    const ids = id.map(i => i.id)
    ids.push(0)

    await queryInterface.sequelize.query(
      `UPDATE feedback_targets SET feedback_open_notification_email_sent = true WHERE id in (${ids})`
    )
  },
}
