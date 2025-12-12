import jwt from 'jsonwebtoken'

import { ApplicationError } from '../../util/ApplicationError'
import { getFeedbackTargetContext } from './getFeedbackTargetContext'
import { JWT_KEY } from '../../util/config'
import { User } from '../../models/user'

/**
 * @feat Gradu survey
 * Returns a token that can be used to enrol to a feedback target.
 * Note that this is only allowed for userCreated feedbackTargets.
 * Only teachers and org admins can get the enrolment token.
 * The enrolment token can always be fetched, but can only be used if the feedback target is open for enrolment.
 */
interface GetEnrolmentTokenParams {
  feedbackTargetId: number
  user: User
}

const getEnrolmentToken = async ({ feedbackTargetId, user }: GetEnrolmentTokenParams) => {
  const { feedbackTarget, access } = await getFeedbackTargetContext({ feedbackTargetId, user })

  if (!access?.canSeeTokens()) throw ApplicationError.Forbidden()

  if (!feedbackTarget.userCreated)
    throw ApplicationError.Forbidden('Only userCreated feedbackTargets can have enrolment tokens')

  return jwt.sign({ feedbackTargetId }, JWT_KEY)
}

export { getEnrolmentToken }
