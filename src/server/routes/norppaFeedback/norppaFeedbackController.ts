import { Router, type Response } from 'express'
import type { AuthenticatedRequest } from 'types'
import { ApplicationError } from '../../util/customErrors'
import { NorppaFeedback, User } from '../../models'
import { adminAccess } from '../../middleware/adminAccess'

const submitFeedback = async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req

  if (!user) {
    res.send([])
    return
  }

  const { feedback, anonymous, responseWanted } = req.body

  const newFeedback = await NorppaFeedback.create({
    data: feedback,
    responseWanted,
    userId: anonymous ? null : user.id,
  })

  const feedbackUser = await User.findByPk(user.id)
  feedbackUser.norppaFeedbackGiven = true
  await feedbackUser.save()

  res.send(newFeedback)
}

const hideBanner = async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req

  if (!user) {
    res.sendStatus(500)
    return
  }

  const acualUser = await User.findByPk(user.id)
  acualUser.norppaFeedbackGiven = true
  await acualUser.save()

  res.sendStatus(200)
}

const getFeedbacks = async (req: AuthenticatedRequest, res: Response) => {
  const feedbacks = await NorppaFeedback.findAll({
    include: [
      {
        model: User,
        as: 'user',
        required: false,
      },
    ],
  })

  res.send(feedbacks)
}

const markAsSolved = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params

  const { solved } = req.body
  if (typeof solved !== 'boolean') throw new ApplicationError('Invalid data: missing "solved" boolean field', 400)

  const feedback = await NorppaFeedback.findByPk(id)
  feedback.solved = solved
  await feedback.save()

  res.sendStatus(200)
}

const getNorppaFeedbackCount = async (req: AuthenticatedRequest, res: Response) => {
  const feedbacks = await NorppaFeedback.count({
    where: {
      solved: false,
    },
  })

  res.send({ count: feedbacks })
}

export const router = Router()

router.get('/', [adminAccess], getFeedbacks)
router.post('/', submitFeedback)
router.put('/hide', hideBanner)
router.put('/:id', [adminAccess], markAsSolved)
router.get('/count', [adminAccess], getNorppaFeedbackCount)
