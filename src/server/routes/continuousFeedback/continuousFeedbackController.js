const { Router } = require('express')
const { ContinuousFeedback } = require('../../models')
const { adminAccess } = require('../../middleware/adminAccess')

const getFeedbacks = async (req, res) => {
  const feedbackTargetId = Number(req.params.id)

  const continuousFeedbacks = await ContinuousFeedback.findAll({
    where: {
      feedbackTargetId,
    },
  })

  return res.send(continuousFeedbacks)
}

const router = Router()

router.get('/:id', getFeedbacks, adminAccess)

module.exports = router
