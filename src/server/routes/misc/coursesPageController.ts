import { Response, Request } from 'express'
import { ApplicationError } from '../../util/customErrors'
import { FeedbackTarget } from '../../models'

export const redirectFromCoursesPage = async (req: Request, res: Response) => {
  const courseId = req.params.id

  const feedbackTarget = await FeedbackTarget.findOne({
    where: {
      courseRealisationId: courseId,
      feedbackType: 'courseRealisation',
    },
  })

  if (!feedbackTarget) {
    ApplicationError.NotFound(`Feedback target not found for course realisation ID: ${courseId}`)
  }

  res.redirect(301, `/targets/${feedbackTarget.id}/feedback`)
}
