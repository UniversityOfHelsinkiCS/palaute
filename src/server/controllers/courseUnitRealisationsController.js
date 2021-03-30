const dateFns = require('date-fns')

const getCourseUnitRealisationsEnrolledBy = require('../util/getCourseUnitRealisationsEnrolledBy')

const getWhereFeedbackEnabled = async (req, res) => {
  const { currentUser } = req
  if (!currentUser) {
    return res.send([])
  }

  const { id } = currentUser

  const startDateBefore = dateFns.subDays(new Date(), 14)
  const endDateAfter = dateFns.subDays(new Date(), 14)

  const courseUnitRealisations = await getCourseUnitRealisationsEnrolledBy(id, {
    startDateBefore,
    endDateAfter,
  })

  return res.send(courseUnitRealisations)
}

module.exports = {
  getWhereFeedbackEnabled,
}
