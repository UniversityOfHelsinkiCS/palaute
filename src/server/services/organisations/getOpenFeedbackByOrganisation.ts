import { QueryTypes } from 'sequelize'
import { LocalizedString } from '@common/types/common'
import { CourseUnit, Feedback, Question } from '../../models'
import { getUniversitySurvey, getProgrammeSurvey } from '../surveys'
import { sequelize } from '../../db/dbConnection'

interface FeedbackData {
  questionId: number
  data: string
}

interface FeedbackWithExtra extends Feedback {
  course_code: string
  feedback_target_id: number
  name: LocalizedString
  start_date: string
  end_date: string
  data: FeedbackData[]
}

interface QuestionWithResponses {
  question: Question
  responses: string[]
}

interface Realisation {
  id: number
  name: LocalizedString
  startDate: string
  endDate: string
  questions: QuestionWithResponses[]
}

interface CourseWithRealisations {
  code: string
  name: LocalizedString
  realisations: Realisation[]
}

const getOpenFeedbackByOrganisation = async (code: string): Promise<CourseWithRealisations[]> => {
  const universitySurvey = await getUniversitySurvey()
  const programmeSurvey = await getProgrammeSurvey(code)

  const programmeQuestions = programmeSurvey ? programmeSurvey.questions : []

  const questions = [...universitySurvey.questions, ...programmeQuestions].filter(q => q.type === 'OPEN')

  const courseCodes = await sequelize.query<CourseUnit>(
    `SELECT DISTINCT ON (C.course_code) C.course_code, C.name FROM course_units C, course_units_organisations CO, organisations O 
    WHERE C.id = CO.course_unit_id AND CO.organisation_id = O.id AND O.code = :code`,
    {
      replacements: { code },
      type: QueryTypes.SELECT,
    }
  )

  if (courseCodes.length === 0) {
    return []
  }

  const allFeedbacks = await sequelize.query<FeedbackWithExtra>(
    `SELECT DISTINCT ON (F.id) F.*, C.course_code, FT.id as feedback_target_id, CR.name, CR.start_date, CR.end_date
    FROM feedbacks F, user_feedback_targets UFT, feedback_targets FT, course_units C, course_realisations CR
    WHERE F.id = UFT.feedback_id AND UFT.feedback_target_id = FT.id AND FT.course_unit_id = C.id AND FT.course_realisation_id = CR.id AND C.course_code IN (:codes)`,
    {
      replacements: {
        codes: courseCodes.map(({ courseCode }) => courseCode),
      },
      type: QueryTypes.SELECT,
    }
  )

  const feedbacksByCourseCode: { [key: string]: FeedbackWithExtra[] } = {}

  allFeedbacks.forEach(feedback => {
    const courseCode = feedback.course_code

    if (feedbacksByCourseCode[courseCode]) {
      feedbacksByCourseCode[courseCode].push(feedback)
    } else {
      feedbacksByCourseCode[courseCode] = [feedback]
    }
  })

  const codesWithIds = courseCodes.map(({ courseCode, name }) => {
    const feedbacks = feedbacksByCourseCode[courseCode] || []

    const feedbacksByTargetId: { [key: number]: FeedbackWithExtra[] } = {}
    const feedbackTargetIds = new Set<number>()

    feedbacks.forEach(feedback => {
      const id = feedback.feedback_target_id
      feedbackTargetIds.add(id)
      if (feedbacksByTargetId[id]) {
        feedbacksByTargetId[id].push(feedback)
      } else {
        feedbacksByTargetId[id] = [feedback]
      }
    })

    const realisations: Realisation[] = Array.from(feedbackTargetIds).map(id => {
      const targetFeedbacks = feedbacksByTargetId[id] || []
      const allFeedbacksWithId = targetFeedbacks.map(feedback => feedback.data).flat()

      const questionsWithResponses = questions.map(question => ({
        question,
        responses: allFeedbacksWithId
          .filter(feedback => feedback.questionId === question.id)
          .map(feedback => feedback.data),
      }))

      return {
        id: targetFeedbacks[0].feedback_target_id,
        name: targetFeedbacks[0].name,
        startDate: targetFeedbacks[0].start_date,
        endDate: targetFeedbacks[0].end_date,
        questions: questionsWithResponses,
      }
    })

    return {
      code: courseCode,
      name,
      realisations,
    }
  })

  return codesWithIds
}

export default getOpenFeedbackByOrganisation
