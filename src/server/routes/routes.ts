import * as Sentry from '@sentry/node'
import express, { json } from 'express'

import { accessLogger } from '../middleware/accessLogger'
import { currentUserMiddleware } from '../middleware/currentUserMiddleware'
import { errorMiddleware } from '../middleware/errorMiddleware'
import { iamGroupsMiddleware } from '../middleware/iamGroupsMiddleware'
import { shibbolethCharsetMiddleware } from '../middleware/shibbolethCharsetMiddleware'
import { initializeSentry } from '../util/sentry'
import { adminRouter } from './admin'
import { continuousFeedbackController } from './continuousFeedback'
import { courseSummaryRouter } from './courseSummary'
import { courseUnitsRouter } from './courseUnits'
import { feedbacksRouter } from './feedbacks'
import { feedbackTargetRouter } from './feedbackTargets'
import { redirectFromCoursesPage } from './misc/coursesPageController'
import { myTeachingRouter } from './myTeaching'
import { noadRouter } from './noad'
import { norppaFeedbackRouter } from './norppaFeedback'
import { organisationRouter } from './organisations'
import { surveysRouter } from './surveys'
import { tagsRouter } from './tags'
import { userController } from './users'

export const router = express()

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
