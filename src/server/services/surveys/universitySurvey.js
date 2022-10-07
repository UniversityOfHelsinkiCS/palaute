const Survey = require('../../models/survey')

/**
 *
 * @returns {Promise<Survey>} university survey
 */
const getUniversitySurvey = async () => {
  const universitySurvey = await Survey.findOne({
    where: { type: 'university' },
  })
  await universitySurvey.populateQuestions()
  return universitySurvey
}

module.exports = getUniversitySurvey
