const { sequelize } = require('./dbConnection')

const GET_RELEVANT_FEEDBACK_TARGETS_FOR_EMAIL = ``

const getFeedbackTargetsForEmail = async () => {
  const rows = await sequelize.query(GET_RELEVANT_FEEDBACK_TARGETS_FOR_EMAIL, {
    replacements: {
      opensAt: new Date(),
      closesAt: new Date(),
    },
    type: sequelize.QueryTypes.SELECT,
  })

  console.log(rows)
}

module.exports = { getFeedbackTargetsForEmail }
