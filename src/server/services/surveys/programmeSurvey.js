const { QueryTypes } = require('sequelize')
const Survey = require('../../models/survey')
const { sequelize } = require('../../util/dbConnection')

/**
 *
 * @param {string} courseUnitId
 * @returns {Promise<Survey[]>} programme surveys for course unit
 */
const getProgrammeSurveysByCourseUnit = async (courseUnitId) => {
  /**
   * @type {Survey[]}
   */
  const programmeSurveys = await sequelize.query(
    `
    SELECT s.*, o.public_question_ids as "publicQuestionIds"
    FROM
      surveys s, organisations o, course_units_organisations cu_o
    WHERE
      s.type = 'programme' AND
      s.type_id = o.code AND
      cu_o.course_unit_id = :courseUnitId AND
      cu_o.organisation_id = o.id AND
      ARRAY_LENGTH(s.question_ids, 1) > 0
  `,
    {
      type: QueryTypes.SELECT,
      replacements: { courseUnitId },
      model: Survey,
      mapToModel: true,
    },
  )

  for (const survey of programmeSurveys) {
    await survey.populateQuestions()
  }
  return programmeSurveys
}

/**
 *
 * @param {string} code
 * @returns {Promise<Survey>} programme survey
 */
const getProgrammeSurvey = async (code) => {
  const survey = await Survey.findOne({
    where: { type: 'programme', typeId: code },
  })
  if (survey) {
    await survey.populateQuestions()
  }
  return survey
}

module.exports = {
  getProgrammeSurveysByCourseUnit,
  getProgrammeSurvey,
}
