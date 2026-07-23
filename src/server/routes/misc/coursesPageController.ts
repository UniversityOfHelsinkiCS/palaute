import { Response, Request } from 'express'

import { FeedbackTarget } from '../../models'
import { ApplicationError } from '../../util/ApplicationError'

export const redirectFromCoursesPage = async (req: Request, res: Response) => {
  const courseId = req.params.id

  const feedbackTarget = await FeedbackTarget.findOne({
    where: {
      courseRealisationId: courseId,
      feedbackType: 'courseRealisation',
    },
  })

  if (!feedbackTarget) {
    throw ApplicationError.NotFound(`Feedback target not found for course realisation ID: ${courseId}`)
  }

  res.redirect(301, `/targets/${feedbackTarget.id}/feedback`)
}
