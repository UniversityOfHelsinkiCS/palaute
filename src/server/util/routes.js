const Router = require('express')
const Sentry = require('@sentry/node')
const currentUserMiddleware = require('../middleware/currentUserMiddleware')
const shibbolethCharsetMiddleware = require('../middleware/shibbolethCharsetMiddleware')
const errorMiddleware = require('../middleware/errorMiddleware')
const initializeSentry = require('./sentry')
const feedbacks = require('../controllers/feedbacksController')
const users = require('../controllers/userController')
const surveys = require('../controllers/surveysController')
const feedbackTargets = require('../controllers/feedbackTargetController')
const adminController = require('../controllers/adminController')
const questions = require('../controllers/questionsController')
const courseUnits = require('../controllers/courseUnitController')

const router = Router()

initializeSentry(router)

router.use(Sentry.Handlers.requestHandler())
router.use(Sentry.Handlers.tracingHandler())

router.use(Router.json())

router.use(shibbolethCharsetMiddleware)
router.use(currentUserMiddleware)

router.get('/login', users.getUser)
router.get('/logout', users.logout)

router.get('/users/feedbacks', feedbacks.getFeedbackByUser)
router.get('/users/feedbacks/:id', feedbacks.getFeedbackByUserAndCourseId)

router.post('/feedbacks', feedbacks.create)
router.get('/feedbacks/:id', feedbacks.getOne)
router.put('/feedbacks/:id', feedbacks.update)
router.delete('/feedbacks/:id', feedbacks.destroy)

router.get('/feedback-targets/for-student', feedbackTargets.getForStudent)
router.get('/feedback-targets/for-teacher', feedbackTargets.getForTeacher)
router.get('/feedback-targets/with-feedbacks/:id', feedbackTargets.getFeedbacks)
router.get('/feedback-targets/:id', feedbackTargets.getOne)
router.put('/feedback-targets/:id', feedbackTargets.update)

router.put('/surveys/:id', surveys.update)
router.post('/surveys/:id/questions', surveys.addQuestion)

router.get('/questions', questions.getAll)
router.get('/questions/:id', questions.getOne)
router.put('/questions/:id', questions.update)
router.delete('/questions/:id', questions.destroy)

router.get(
  '/course-units/responsible',
  feedbackTargets.getCourseUnitsForTeacher,
)

router.get(
  '/course-units/:id/feedback-targets',
  feedbackTargets.getTargetsByCourseUnit,
)

router.get('/course-units/:code', courseUnits.getOne)
router.get('/course-units/:code/survey', surveys.getSurveyByCourseCode)

router.get('/trigger-sentry', () => {
  const mluukkai = 'isNotAFunction'
  mluukkai()
})

router.use('/admin', adminController)

router.use(Sentry.Handlers.errorHandler())

router.use(errorMiddleware)

module.exports = router
