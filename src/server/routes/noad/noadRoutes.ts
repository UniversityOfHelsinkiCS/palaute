import { Router } from 'express'
import { getCourses, getNoadUser } from './noAdUserController'
import { feedbackTargetRouter } from '../feedbackTargets'
import { feedbacksRouter } from '../feedbacks'

export const noadRouter = Router()

noadRouter.get('/courses', getCourses)
noadRouter.use('/feedback-targets/', feedbackTargetRouter.noad)
noadRouter.use('/feedbacks', feedbacksRouter.noad)
noadRouter.get('/user', getNoadUser)
