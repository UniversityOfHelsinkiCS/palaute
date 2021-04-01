const dateFns = require('date-fns')

const {
  getCourseUnitRealisationsWhereResponsible,
  getCourseUnitRealisationById,
  getCourseUnitRealisationsEnrolledBy,
} = require('../util/importerCourseUnitRealisations')

const getOne = async (req, res) => {
  const realisation = await getCourseUnitRealisationById(req.params.id)
  res.send(realisation)
}

const getWhereResponsible = async (req, res) => {
  const {
    currentUser: { id },
  } = req

  const realisations = await getCourseUnitRealisationsWhereResponsible(id)

  res.send(realisations)
}

const getWhereFeedbackEnabled = async (req, res) => {
  const {
    currentUser: { id },
  } = req

  const startDateBefore = dateFns.subDays(new Date(), 14)
  const endDateAfter = dateFns.subDays(new Date(), 14)

  const courseUnitRealisations = await getCourseUnitRealisationsEnrolledBy(id, {
    startDateBefore,
    endDateAfter,
  })

  return res.send(courseUnitRealisations)
}

module.exports = {
  getOne,
  getWhereResponsible,
  getWhereFeedbackEnabled,
}
