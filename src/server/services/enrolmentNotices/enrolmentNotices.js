const { subSeconds } = require('date-fns')
const { redis } = require('../../util/redisClient')
const { mailer } = require('../../mailer')

const EXPIRATION_SECONDS = 24 * 3600

const getKey = (userId, feedbackTargetId) => `${feedbackTargetId}#${userId}`

const requestEnrolmentNotification = async (
  userId,
  feedbackTargetId,
  enable,
) => {
  const key = getKey(userId, feedbackTargetId)
  if (enable) {
    await redis.set(key, 'true')
    await redis.expire(key, EXPIRATION_SECONDS)
  } else {
    await redis.delete(key)
  }
}

const getEnrolmentNotification = async (userId, feedbackTargetId) => {
  const key = getKey(userId, feedbackTargetId)
  const exists = await redis.get(key)
  return Boolean(exists)
}

const sendEmailNotifications = async (userFeedbackTargets) => {
  mailer.sendEmailNotificationAboutEnrolments(userFeedbackTargets)

  for (const ufbt of userFeedbackTargets) {
    await redis.delete(getKey(ufbt.userId, ufbt.feedbackTargetId))
  }
}

const notifyOnEnrolmentsIfRequested = async (userFeedbackTargets) => {
  const expiredDate = subSeconds(new Date(), EXPIRATION_SECONDS)

  const exists = []

  for (const ufbt of userFeedbackTargets) {
    if (ufbt.createdAt < expiredDate || ufbt.accessStatus !== 'STUDENT') {
      exists.push(false)
      return
    }
    const key = getKey(ufbt.userId, ufbt.feedbackTargetId)
    const exist = await redis.get(key)
    exists.push(Boolean(exist))
  }

  const filtered = userFeedbackTargets.filter((_, index) => exists[index])

  if (filtered.length > 0) {
    // dont await, it might be slow
    sendEmailNotifications(filtered)
  }
}

module.exports = {
  requestEnrolmentNotification,
  getEnrolmentNotification,
  notifyOnEnrolmentsIfRequested,
}
