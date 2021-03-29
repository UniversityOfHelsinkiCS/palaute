const Router = require('express')
const shibbolethCharsetMiddleware = require('../middleware/shibbolethCharsetMiddleware')
const errorMiddleware = require('../middleware/errorMiddleware')
const currentUserMiddleware = require('../middleware/currentUserMiddleware')
const feedbacks = require('../controllers/feedbacksController')

const router = Router()

router.use(shibbolethCharsetMiddleware)
router.use(currentUserMiddleware)

router.get('/feedbacks', feedbacks.getAll)
router.post('/feedbacks', feedbacks.create)
router.get('/feedbacks/:id', feedbacks.getOne)
router.put('/feedbacks/:id', feedbacks.update)
router.delete('/feedbacks/:id', feedbacks.destroy)
router.get('/feedbacks/user/:uid', feedbacks.getAllByUser)

router.use(errorMiddleware)

module.exports = router
