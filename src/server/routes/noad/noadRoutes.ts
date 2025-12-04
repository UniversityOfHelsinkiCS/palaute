import { Router } from 'express'
import { getCourses, getNoadUser } from './noAdUserController'
import { feedbackTargetRouter } from '../feedbackTargets'
import feedbacks from '../feedbacks'

export const noadRouter = Router()

noadRouter.get('/courses', getCourses)
noadRouter.use('/feedback-targets/', feedbackTargetRouter.noad)
noadRouter.use('/feedbacks', feedbacks.noad)
noadRouter.get('/user', getNoadUser)
