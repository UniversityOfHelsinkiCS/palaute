const Router = require('express')
const Sentry = require('@sentry/node')
const { inE2EMode } = require('../util/config')
const accessLogger = require('../middleware/accessLogger')
const currentUserMiddleware = require('../middleware/currentUserMiddleware')
const shibbolethCharsetMiddleware = require('../middleware/shibbolethCharsetMiddleware')
const errorMiddleware = require('../middleware/errorMiddleware')
const iamGroupsMiddleware = require('../middleware/iamGroupsMiddleware')
const initializeSentry = require('../util/sentry')
const feedbacks = require('./feedbacks')
const users = require('./users')
const surveys = require('./surveys')
const feedbackTargets = require('./feedbackTargets')
const admin = require('./admin')
const courseSummary = require('./courseSummary')
const organisation = require('./organisations')
const courseUnit = require('./courseUnits')
const testing = require('./testing')
const noad = require('./noad')
const norppaFeedback = require('./norppaFeedback')
const { redirectFromCoursesPage } = require('./misc/coursesPageController')

const router = Router()

initializeSentry(router)

router.use(Sentry.Handlers.requestHandler())
router.use(Sentry.Handlers.tracingHandler())
router.use(Router.json())
router.use(shibbolethCharsetMiddleware)
router.use(accessLogger)
router.use(iamGroupsMiddleware)
router.use(currentUserMiddleware)

router.use('/ping', (_, res) => res.sendStatus(204))
router.use('/noad', noad)
router.use('/', users)
router.use('/feedbacks', feedbacks.ad)
router.use('/feedback-targets', feedbackTargets.ad)
router.use('/surveys', surveys)
router.use('/course-summaries', courseSummary)
router.use('/organisations', organisation)
router.use('/course-units', courseUnit)
router.use('/norppa-feedback', norppaFeedback)
router.use('/admin', admin)

if (inE2EMode) {
  router.use('/test', testing)
}

// Link from courses-page
router.use('/cur/:id', redirectFromCoursesPage)

router.use(Sentry.Handlers.errorHandler())
router.use(errorMiddleware)

module.exports = router
