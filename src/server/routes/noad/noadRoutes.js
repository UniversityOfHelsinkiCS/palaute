const { Router } = require('express')
const noAdUserController = require('./noAdUserController')
const feedbackTargets = require('../feedbackTargets')
const feedbacks = require('../feedbacks')

const noadRouter = Router()

noadRouter.get('/courses', noAdUserController.getCourses)
noadRouter.use('/feedback-targets/', feedbackTargets.noad)
noadRouter.use('/feedbacks', feedbacks.noad)

module.exports = noadRouter
