import { UserFeedbackTarget } from '../../models'
import { ApplicationError } from '../../util/customErrors'

// Defining types for the input parameters
interface NotGivingFeedbackParams {
  feedbackTargetId: number
  user: {
    id: string
  }
}

export const notGivingFeedback = async ({ feedbackTargetId, user }: NotGivingFeedbackParams): Promise<any> => {
  const userFeedbackTargets = await UserFeedbackTarget.findAll({
    where: {
      userId: user.id,
      feedbackTargetId,
    },
  })

  if (userFeedbackTargets.length === 0 || userFeedbackTargets.length > 1) {
    return ApplicationError.BadRequest('Matching userFeedbackTarget not found')
  }

  const userFeedbackTarget = userFeedbackTargets[0]

  userFeedbackTarget.notGivingFeedback = true
  await userFeedbackTarget.save()

  return userFeedbackTarget.toJSON()
}
