import { Router } from 'express'

import { feedbacksRouter } from '../feedbacks'
import { feedbackTargetRouter } from '../feedbackTargets'
import { getCourses, getNoadUser } from './noAdUserController'

export const noadRouter = Router()

noadRouter.get('/courses', getCourses)
noadRouter.use('/feedback-targets/', feedbackTargetRouter.noad)
noadRouter.use('/feedbacks', feedbacksRouter.noad)
noadRouter.get('/user', getNoadUser)
