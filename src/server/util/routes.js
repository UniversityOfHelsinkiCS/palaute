const Router = require('express')
const shibbolethCharsetMiddleware = require('../middleware/shibbolethCharsetMiddleware')
const errorMiddleware = require('../middleware/errorMiddleware')
const currentUserMiddleware = require('../middleware/currentUserMiddleware')
const feedbacks = require('../controllers/feedbacksController')
const courseUnitRealisations = require('../controllers/courseUnitRealisationsController')

const router = Router()

router.use(shibbolethCharsetMiddleware)
router.use(currentUserMiddleware)

router.get('/feedbacks', feedbacks.getAll)
router.post('/feedbacks', feedbacks.create)
router.get('/feedbacks/:id', feedbacks.getOne)
router.put('/feedbacks/:id', feedbacks.update)
router.delete('/feedbacks/:id', feedbacks.destroy)
router.get('/feedbacks/user/:uid', feedbacks.getFeedbackByUser)

router.get(
  '/course-unit-realisations/feedback-enabled',
  courseUnitRealisations.getWhereFeedbackEnabled,
)

router.use(errorMiddleware)

module.exports = router
