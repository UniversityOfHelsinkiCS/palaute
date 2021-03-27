const Router = require('express')
const messages = require('../controllers/messagesController')
const feedbacks = require('../controllers/feedbacksController')
const router = Router()

router.get('/messages', messages.getAll)
router.post('/messages', messages.create)
router.get('/messages/:id', messages.getOne)
router.put('/messages/:id', messages.update)
router.delete('/messages/:id', messages.destroy)

router.get('/feedbacks', feedbacks.getAll)
router.post('/feedbacks', feedbacks.create)
router.get('/feedbacks/:id', feedbacks.getOne)
router.put('/feedbacks/:id', feedbacks.update)
router.delete('/feedbacks/:id', feedbacks.destroy)

module.exports = router
