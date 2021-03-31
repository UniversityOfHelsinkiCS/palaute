const Router = require('express')
const shibbolethCharsetMiddleware = require('../middleware/shibbolethCharsetMiddleware')
const errorMiddleware = require('../middleware/errorMiddleware')
const currentUserMiddleware = require('../middleware/currentUserMiddleware')
const feedbacks = require('../controllers/feedbacksController')
const courseUnitRealisations = require('../controllers/courseUnitRealisationsController')
const users = require('../controllers/userController')

const router = Router()

router.use(shibbolethCharsetMiddleware)
router.use(currentUserMiddleware)

router.get('/login', users.getUser)

router.get('/feedbacks', feedbacks.getAll)
router.post('/feedbacks', feedbacks.create)
router.get('/users/feedbacks', feedbacks.getFeedbackByUser)
router.get('/users/feedbacks/:id', feedbacks.getFeedbackByUserAndCourseId)
router.get('/feedbacks/:id', feedbacks.getOne)
router.get('/courses/:id/feedbacks', feedbacks.getFeedbackByCourseId)
router.put('/feedbacks/:id', feedbacks.update)
router.delete('/feedbacks/:id', feedbacks.destroy)

router.get(
  '/course-unit-realisations/feedback-enabled',
  courseUnitRealisations.getWhereFeedbackEnabled,
)

router.get('/trigger_sentry', () => {
  const mluukkai = 'isNotAFunction'
  mluukkai()
})

router.use(errorMiddleware)

module.exports = router
