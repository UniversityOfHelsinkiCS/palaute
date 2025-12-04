const Router = require('express')
const Sentry = require('@sentry/node')
const { accessLogger } = require('../middleware/accessLogger')
const { currentUserMiddleware } = require('../middleware/currentUserMiddleware')
const { shibbolethCharsetMiddleware } = require('../middleware/shibbolethCharsetMiddleware')
const { errorMiddleware } = require('../middleware/errorMiddleware')
const { iamGroupsMiddleware } = require('../middleware/iamGroupsMiddleware')
const { initializeSentry } = require('../util/sentry')
const feedbacks = require('./feedbacks')
const { userController } = require('./users')
const { surveysRouter } = require('./surveys')
const feedbackTargets = require('./feedbackTargets')
const admin = require('./admin')
const courseSummary = require('./courseSummary')
const organisation = require('./organisations')
const courseUnit = require('./courseUnits')
const myTeaching = require('./myTeaching')
const { tagsRouter } = require('./tags')
const noad = require('./noad')
const { norppaFeedbackRouter } = require('./norppaFeedback')
const { continuousFeedbackController } = require('./continuousFeedback')
const { redirectFromCoursesPage } = require('./misc/coursesPageController')

const router = Router()

initializeSentry()

router.use(Router.json())
router.use(shibbolethCharsetMiddleware)
router.use(accessLogger)

router.use(['/ping', '/noad/ping'], (_, res) => res.sendStatus(204))

router.use(iamGroupsMiddleware)
router.use(currentUserMiddleware)

router.use('/noad', noad)
router.use('/', userController)
router.use('/feedbacks', feedbacks.ad)
router.use('/feedback-targets', feedbackTargets.ad)
router.use('/surveys', surveysRouter)
router.use('/course-summaries', courseSummary)
router.use('/organisations', organisation)
router.use('/course-units', courseUnit)
router.use('/my-teaching', myTeaching)
router.use('/tags', tagsRouter)
router.use('/norppa-feedback', norppaFeedbackRouter)
router.use('/continuous-feedback', continuousFeedbackController)
router.use('/admin', admin)

// Link from courses-page
router.use('/cur/:id', redirectFromCoursesPage)

Sentry.setupExpressErrorHandler(router)
router.use(errorMiddleware)

module.exports = router
