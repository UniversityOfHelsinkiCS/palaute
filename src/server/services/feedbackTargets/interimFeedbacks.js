const { Op } = require('sequelize')

const { formatActivityPeriod } = require('../../util/common')
const { FeedbackTarget, CourseRealisation, CourseUnit } = require('../../models')

const createInterimFeedbackTarget = async (parentId, feedbackTargetData) => {
  const { name } = feedbackTargetData
  const { startDate, endDate } = formatActivityPeriod(feedbackTargetData)

  const parentFbt = await FeedbackTarget.findByPk(parentId)

  if (!parentFbt) throw new Error('Parent feedback target not found')

  const parentCUR = await CourseRealisation.findByPk(parentFbt.courseRealisationId)

  const parentCU = await CourseUnit.findByPk(parentFbt.courseUnitId)

  const interimFeedbackTarget = await FeedbackTarget.create({
    feedbackType: 'courseRealisation',
    typeId: parentCUR.id,
    courseUnitId: parentCU.id,
    courseRealisationId: parentCUR.id,
    name,
    hidden: false,
    opensAt: startDate,
    closesAt: endDate,
    userCreated: true,
  })

  return interimFeedbackTarget
}

module.exports = {
  createInterimFeedbackTarget,
}
