const { Op } = require('sequelize')
const jwt = require('jsonwebtoken')
const { UserFeedbackTarget, User } = require('../models')
const { JWT_KEY } = require('./config')

/* eslint-disable */

const getTiraUrls = async () => {
  const feedbackTargets = await UserFeedbackTarget.findAll({
    where: {
      feedbackTargetId: {
        [Op.eq]: 2733652,
      },
    },
    include: [
      {
        model: User,
        as: 'user',
        required: true,
        attributes: ['id', 'username', 'studentNumber'],
      },
    ],
  })

  for (const fbt of feedbackTargets) {
    const { user } = fbt
    const { id, username, studentNumber } = user

    if (username === id) {
      const token = jwt.sign({ username }, JWT_KEY)
      console.log(
        studentNumber,
        `https://coursefeedback.helsinki.fi/noad/token/${token}`,
      )
    } else {
      console.log(studentNumber)
    }
  }
}

getTiraUrls()
