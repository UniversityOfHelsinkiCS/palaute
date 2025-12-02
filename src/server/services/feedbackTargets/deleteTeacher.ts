import { UserFeedbackTarget } from '../../models'
import { ApplicationError } from '../../util/customErrors'
import cache from './feedbackTargetCache'
import { getFeedbackTargetContext } from './getFeedbackTargetContext'
import { User } from '../../models/user'

interface DeleteTeacherParams {
  feedbackTargetId: number
  teacherId: string
  user: User
}

const deleteTeacher = async ({ feedbackTargetId, teacherId, user }: DeleteTeacherParams) => {
  const { access } = await getFeedbackTargetContext({
    feedbackTargetId,
    user,
  })

  if (!access?.canDeleteTeacher()) ApplicationError.Forbidden()

  const userFeedbackTargetToDelete = await UserFeedbackTarget.findOne({
    where: {
      feedbackTargetId,
      userId: teacherId,
    },
  })

  if (!userFeedbackTargetToDelete) {
    ApplicationError.NotFound(`Teacher ${teacherId} not found on target ${feedbackTargetId}`)
  }

  await userFeedbackTargetToDelete.destroy()

  cache.invalidate(feedbackTargetId)
}

export { deleteTeacher }
