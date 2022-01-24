const { Op } = require('sequelize')
const jwt = require('jsonwebtoken')
const {
  UserFeedbackTarget,
  User,
  FeedbackTarget,
  CourseUnit,
  CourseRealisation,
} = require('../models')
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

const getCoursesWithNoStudents = async () => {
  const feedbackTargets = await FeedbackTarget.findAll({
    where: {
      feedbackType: {
        [Op.eq]: 'courseRealisation',
      },
    },
    include: [
      {
        model: CourseRealisation,
        as: 'courseRealisation',
        required: true,
        where: {
          startDate: {
            [Op.gt]: '2021-09-01 00:00:00',
          },
          endDate: {
            [Op.lt]: '2021-12-30 00:00:00',
          },
        },
      },
      {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        required: true,
      },
      {
        model: CourseUnit,
        as: 'courseUnit',
        required: true,
      },
    ],
  })

  let relevantFbt = []

  for (const fbt of feedbackTargets) {
    let notRelevant = false
    for (const ufbt of fbt.userFeedbackTargets) {
      if (ufbt.accessStatus === 'STUDENT') {
        notRelevant = true
      }
    }
    if (!notRelevant) {
      relevantFbt.push(fbt)
    }
  }

  for (const r of relevantFbt) {
    console.log(r.courseUnit.name.fi, ';', r.id)
  }
}

// getCoursesWithNoStudents()

// getTiraUrls()
