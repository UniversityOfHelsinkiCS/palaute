const importerClient = require('./importerClient')

const { AssessmentItem } = require('../models')

const createAssessmentItem = async (data) => {
  const [assessmentItem] = await AssessmentItem.findOrCreate({
    where: {
      id: data.id,
    },
    defaults: {
      id: data.id,
      name: data.name,
      nameSpecifier: data.nameSpecifier,
      assessmentItemType: data.assessmentItemType,
    },
  })

  return assessmentItem
}

const getAssessmentItemsByCourseUnitRealisationId = async (
  courseUnitRealisationId,
) => {
  const { data } = await importerClient.get(
    `/palaute/course_unit_realisations/${courseUnitRealisationId}/assessment_items`,
  )

  const assessmentItems = await data.reduce(
    async (prevPromise, assessmentItem) => {
      await prevPromise
      return createAssessmentItem(assessmentItem)
    },
    Promise.resolve(),
  )

  return assessmentItems
}

module.exports = {
  getAssessmentItemsByCourseUnitRealisationId,
}
