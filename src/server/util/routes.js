const Router = require('express')
const Sentry = require('@sentry/node')

const errorMiddleware = require('../middleware/errorMiddleware')

const feedbacks = require('../controllers/feedbacksController')
const courseUnitRealisations = require('../controllers/courseUnitRealisationsController')
const users = require('../controllers/userController')
const questions = require('../controllers/questionsController')

const router = Router()

router.get('/login', users.getUser)

router.get('/users/feedbacks', feedbacks.getFeedbackByUser)
router.get('/users/feedbacks/:id', feedbacks.getFeedbackByUserAndCourseId)

router.get('/feedbacks', feedbacks.getAll)
router.post('/feedbacks', feedbacks.create)
router.get('/feedbacks/:id', feedbacks.getOne)
router.put('/feedbacks/:id', feedbacks.update)
router.delete('/feedbacks/:id', feedbacks.destroy)

router.get('/courses/:id/feedbacks', feedbacks.getFeedbackByCourseId)
router.get('/courses/:id/questions', questions.getQuestionsByCourseId)
router.put('/courses/:id/questions', questions.updateQuestionsByCourseId)

router.get(
  '/course-unit-realisations/feedback-enabled',
  courseUnitRealisations.getWhereFeedbackEnabled,
)

router.get(
  '/course-unit-realisations/responsible',
  courseUnitRealisations.getWhereResponsible,
)

router.get('/course-unit-realisations/:id', courseUnitRealisations.getOne)

router.get('/trigger_sentry', () => {
  const mluukkai = 'isNotAFunction'
  mluukkai()
})

// according to docs this should be after all controllers but before error middlewares
router.use(Sentry.Handlers.errorHandler())

router.use(errorMiddleware)

module.exports = router
