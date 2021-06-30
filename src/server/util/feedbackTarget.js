const { sequelize } = require('./dbConnection')

const GET_RELEVANT_FEEDBACK_TARGETS_FOR_EMAIL = `
    SELECT *
    FROM feedback_targets WHERE
    opens_at < NOW() - interval '1 day' AND
    closes_at > NOW() + interval '1 day' AND
    feedback_open_notification_email_sent = false
`

const getFeedbackTargetsForEmail = async () => {
  const rows = await sequelize.query(GET_RELEVANT_FEEDBACK_TARGETS_FOR_EMAIL, {
    type: sequelize.QueryTypes.SELECT,
  })

  return []
}

module.exports = { getFeedbackTargetsForEmail }
