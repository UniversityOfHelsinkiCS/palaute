import { QueryTypes } from 'sequelize'
import { Survey } from '../../models/survey'
import { sequelize } from '../../db/dbConnection'

export const getProgrammeSurveysByCourseUnit = async (courseUnitId: string) => {
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
    }
  )

  for (const survey of programmeSurveys) {
    await survey.populateQuestions()
  }
  return programmeSurveys
}

export const getProgrammeSurvey = async (code: string) => {
  const survey = await Survey.findOne({
    where: { type: 'programme', typeId: code },
  })
  if (survey) {
    await survey.populateQuestions()
  }
  return survey
}
