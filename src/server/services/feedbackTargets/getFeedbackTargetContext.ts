import { FeedbackTarget, UserFeedbackTarget, CourseRealisation, Summary } from '../../models'
import { ApplicationError } from '../../util/ApplicationError'
import { getAccess } from './getAccess'
import { User } from '../../models/user'

/**
 * Fetch fbt, ufbt and compute access object.
 * Useful for all things that consider an action on a single feedback target,
 * where action is either viewing or mutating.
 * Throws 404 when id does not match anything, so you don't have to check that.
 */
interface GetFeedbackTargetContextParams {
  feedbackTargetId: number | string
  user: User
}

const getFeedbackTargetContext = async ({ feedbackTargetId, user }: GetFeedbackTargetContextParams) => {
  const feedbackTarget = await FeedbackTarget.findByPk(feedbackTargetId, {
    include: [
      {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        where: { userId: user.id },
        limit: 1,
        required: false, // If user enrolled/teacher, userfeedback is included. Otherwise not.
      },
      { model: CourseRealisation, as: 'courseRealisation' },
      { model: Summary, as: 'summary' },
    ],
  })

  if (!feedbackTarget) throw ApplicationError.NotFound(`FeedbackTarget with id ${feedbackTargetId} not found`)

  const userFeedbackTarget = feedbackTarget.userFeedbackTargets ? feedbackTarget.userFeedbackTargets[0] : null

  const access = await getAccess({
    userFeedbackTarget,
    feedbackTarget,
    user,
  })

  return {
    feedbackTarget,
    userFeedbackTarget,
    access,
  }
}

export { getFeedbackTargetContext }
