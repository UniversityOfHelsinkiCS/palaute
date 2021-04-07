const {
  getAssessmentItemsByCourseUnitRealisationId,
} = require('../util/importerAssessmentItems')

const getAll = async (req, res) => {
  const {
    query: { course_unit_realisation_id: courseUnitRealisationId },
  } = req

  if (!courseUnitRealisationId) return res.status(501).send('course_unit_realisation_id query required')

  const assessmentItems = await getAssessmentItemsByCourseUnitRealisationId(
    courseUnitRealisationId,
  )

  res.send(assessmentItems)
}

module.exports = {
  getAll,
}
