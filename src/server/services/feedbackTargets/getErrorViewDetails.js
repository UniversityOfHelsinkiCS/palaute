const { FeedbackTarget, CourseUnit, CourseRealisation } = require('../../models')

const getFeedbackErrorViewDetails = id =>
  FeedbackTarget.findByPk(id, {
    attributes: ['id', 'name', 'opensAt', 'closesAt'],
    include: [
      {
        attributes: ['id', 'name', 'userCreated'],
        model: CourseUnit,
        as: 'courseUnit',
        required: true,
      },
      {
        attributes: ['id', 'name', 'userCreated', 'startDate', 'endDate'],
        model: CourseRealisation,
        as: 'courseRealisation',
        required: true,
      },
    ],
  })

module.exports = { getFeedbackErrorViewDetails }
