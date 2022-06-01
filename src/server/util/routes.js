const Router = require('express')
const Sentry = require('@sentry/node')
const { inE2EMode } = require('./config')
const accessLogger = require('../middleware/accessLogger')
const currentUserMiddleware = require('../middleware/currentUserMiddleware')
const shibbolethCharsetMiddleware = require('../middleware/shibbolethCharsetMiddleware')
const errorMiddleware = require('../middleware/errorMiddleware')
const iamGroupsMiddleware = require('../middleware/iamGroupsMiddleware')
const initializeSentry = require('./sentry')
const feedbacks = require('../controllers/feedbacksController')
const users = require('../controllers/userController')
const surveys = require('../controllers/surveysController')
const feedbackTargets = require('../controllers/feedbackTargetController')
const adminController = require('../controllers/adminController')
const courseSummary = require('../controllers/courseSummaryController')
const organisation = require('../controllers/organisationController')
const courseUnit = require('../controllers/courseUnitController')
const courseRealisation = require('../controllers/courseRealisationController')
const testingController = require('../controllers/testingController')
const noAdUserController = require('../controllers/noAdUserController')
const norppaFeedbackController = require('../controllers/norppaFeedbackController')

const router = Router()

initializeSentry(router)

router.use(Sentry.Handlers.requestHandler())
router.use(Sentry.Handlers.tracingHandler())

router.use(Router.json())

router.use(shibbolethCharsetMiddleware)
router.use(accessLogger)
router.use(iamGroupsMiddleware)

router.use(currentUserMiddleware)

router.get('/noad/courses', noAdUserController.getCourses)

router.get('/noad/feedback-targets/:id', feedbackTargets.getOne)
router.get('/noad/feedback-targets/:id/feedbacks', feedbackTargets.getFeedbacks)
router.post('/noad/feedbacks', feedbacks.create)
router.put('/noad/feedbacks/:id', feedbacks.update)
router.delete('/noad/feedbacks/:id', feedbacks.destroy)

router.get('/login', users.getUser)
router.get('/logout', users.logout)
router.get('/users', users.getUserByEmail)
router.post('/feedbacks', feedbacks.create)
router.get('/feedbacks/:id', feedbacks.getOne)
router.put('/feedbacks/:id', feedbacks.update)
router.delete('/feedbacks/:id', feedbacks.destroy)

router.get('/feedback-targets/for-student', feedbackTargets.getForStudent)
router.get('/feedback-targets/:id', feedbackTargets.getOne)
router.put('/feedback-targets/:id', feedbackTargets.update)
router.get('/feedback-targets/:id/feedbacks', feedbackTargets.getFeedbacks)
router.get('/feedback-targets/:id/users', feedbackTargets.getUsers)
router.get(
  '/feedback-targets/:id/feedback-count',
  feedbackTargets.getFeedbackCount,
)
router.get('/feedback-targets/:id/logs', feedbackTargets.getLogs)

router.put(
  '/feedback-targets/:id/response',
  feedbackTargets.updateFeedbackResponse,
)

router.put(
  '/feedback-targets/:id/remind-students',
  feedbackTargets.remindStudentsOnFeedback,
)

router.get(
  '/feedback-targets/:id/students-with-feedback',
  feedbackTargets.getStudentsWithFeedback,
)

router.put(
  '/feedback-targets/:id/open-immediately',
  feedbackTargets.openFeedbackImmediately,
)

router.put(
  '/feedback-targets/:id/close-immediately',
  feedbackTargets.closeFeedbackImmediately,
)

router.delete(
  '/feedback-targets/:id/user-feedback-targets/:userId',
  feedbackTargets.deleteUserFeedbackTarget,
)

router.put('/surveys/:id', surveys.update)
router.post('/surveys/:id/questions', surveys.addQuestion)
router.get('/surveys/university', surveys.getUniversitySurvey)
router.get('/surveys/programme/:surveyCode', surveys.getProgrammeSurvey)

router.get('/course-units/responsible', courseUnit.getCourseUnitsForTeacher)

router.get(
  '/course-units/:id/feedback-targets',
  feedbackTargets.getTargetsByCourseUnit,
)

router.get('/course-units/:code/survey', surveys.getSurveyByCourseCode)

router.get('/course-summaries/organisations', courseSummary.getByOrganisations)

router.get(
  '/course-summaries/course-units/:code',
  courseSummary.getByCourseUnit,
)

router.get(
  '/course-summaries/organisations/:code',
  courseSummary.getByOrganisation,
)

router.get('/course-summaries/access', courseSummary.getAccessInfo)

router.get('/organisations', organisation.getOrganisations)
router.put('/organisations/:code', organisation.updateOrganisation)
router.get('/organisations/:code', organisation.getOrganisationByCode)
router.get(
  '/organisations/:code/open',
  courseSummary.getOpenQuestionsByOrganisation,
)

router.get('/organisations/:code/logs', organisation.getOrganisationLogs)

router.get(
  '/organisations/:code/course-units',
  courseUnit.getCourseUnitsByOrganisation,
)

router.get(
  '/course-realisations/:id/feedback-targets',
  courseRealisation.getFeedbackTargetsByCourseRealisation,
)

router.get('/norppa-feedback', norppaFeedbackController.getFeedbacks)
router.post('/norppa-feedback', norppaFeedbackController.submitFeedback)
router.put('/norppa-feedback/hide', norppaFeedbackController.hideBanner)
router.put('/norppa-feedback/:id', norppaFeedbackController.markAsSolved)
router.get(
  '/norppa-feedback/count',
  norppaFeedbackController.getNorppaFeedbackCount,
)

router.use('/admin', adminController)

if (inE2EMode) {
  router.use('/test', testingController)
}

// Link from courses-page

router.use('/cur/:id', courseRealisation.feedbackTargetByCourseRealisation)

router.use(Sentry.Handlers.errorHandler())

router.use(errorMiddleware)

module.exports = router
