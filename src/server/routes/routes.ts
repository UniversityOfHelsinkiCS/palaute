import { Router, json } from 'express'
import * as Sentry from '@sentry/node'
import { accessLogger } from '../middleware/accessLogger'
import { currentUserMiddleware } from '../middleware/currentUserMiddleware'
import { shibbolethCharsetMiddleware } from '../middleware/shibbolethCharsetMiddleware'
import { errorMiddleware } from '../middleware/errorMiddleware'
import { iamGroupsMiddleware } from '../middleware/iamGroupsMiddleware'
import { initializeSentry } from '../util/sentry'
import { feedbacksRouter } from './feedbacks'
import { userController } from './users'
import { surveysRouter } from './surveys'
import { feedbackTargetRouter } from './feedbackTargets'
import { adminRouter } from './admin'
import { courseSummaryRouter } from './courseSummary'
import { organisationRouter } from './organisations'
import { courseUnitsRouter } from './courseUnits'
import { myTeachingRouter } from './myTeaching'
import { tagsRouter } from './tags'
import { noadRouter } from './noad'
import { norppaFeedbackRouter } from './norppaFeedback'
import { continuousFeedbackController } from './continuousFeedback'
import { redirectFromCoursesPage } from './misc/coursesPageController'

export const router = Router()

initializeSentry()

router.use(json())
router.use(shibbolethCharsetMiddleware)
router.use(accessLogger)

router.use(['/ping', '/noad/ping'], (_, res) => {
  res.sendStatus(204)
})

router.use(iamGroupsMiddleware)
router.use(currentUserMiddleware)

router.use('/noad', noadRouter)
router.use('/', userController)
router.use('/feedbacks', feedbacksRouter.ad)
router.use('/feedback-targets', feedbackTargetRouter.ad)
router.use('/surveys', surveysRouter)
router.use('/course-summaries', courseSummaryRouter)
router.use('/organisations', organisationRouter)
router.use('/course-units', courseUnitsRouter)
router.use('/my-teaching', myTeachingRouter)
router.use('/tags', tagsRouter)
router.use('/norppa-feedback', norppaFeedbackRouter)
router.use('/continuous-feedback', continuousFeedbackController)
router.use('/admin', adminRouter)

// Link from courses-page
router.use('/cur/:id', redirectFromCoursesPage)

Sentry.setupExpressErrorHandler(router)
router.use(errorMiddleware)
