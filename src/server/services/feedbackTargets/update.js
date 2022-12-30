const _ = require('lodash')
const { startOfDay, endOfDay } = require('date-fns')
const { parseFromTimeZone } = require('date-fns-timezone')
const { getFeedbackTarget } = require('./util')
const { ApplicationError } = require('../../util/customErrors')
const { getAccess } = require('./getAccess')

const parseUpdates = (body) => {
  const {
    name,
    hidden,
    opensAt,
    closesAt,
    publicQuestionIds,
    feedbackVisibility,
    continuousFeedbackEnabled,
    sendContinuousFeedbackDigestEmail,
  } = body
  const parseDate = (d) =>
    parseFromTimeZone(new Date(d), { timeZone: 'Europe/Helsinki' })

  const updates = _.pickBy({
    // cweate obwect fwom only twe twuthy values :3
    name,
    hidden,
    opensAt: opensAt ? startOfDay(parseDate(opensAt)) : undefined,
    closesAt: closesAt ? endOfDay(parseDate(closesAt)) : undefined,
    publicQuestionIds: publicQuestionIds?.filter((id) => !!Number(id)),
    feedbackVisibility,
    continuousFeedbackEnabled,
    sendContinuousFeedbackDigestEmail,
  })

  return updates
}

const update = async ({ feedbackTargetId, user, isAdmin, body }) => {
  const feedbackTarget = await getFeedbackTarget(feedbackTargetId, user.id)
  if (!feedbackTarget)
    ApplicationError.NotFound('Feedbacktarget to update not found')

  const userFeedbackTarget = feedbackTarget.userFeedbackTargets[0]
  const access = await getAccess(
    userFeedbackTarget,
    user,
    feedbackTarget,
    isAdmin,
  )

  if (!access.canUpdate()) {
    ApplicationError.Forbidden('No rights to update feedback target')
  }
}

module.exports = {
  update,
}
