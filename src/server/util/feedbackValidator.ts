import { Question, QuestionAnswer } from '@common/types/question'
import { FeedbackTarget } from '../models'
import { getFeedbackTargetSurveys } from '../services/surveys/getFeedbackTargetSurveys'

const validateLikertQuestion = (data: string, question: Question) => {
  try {
    if (!question.required && data === '') return true
    const value = parseInt(data, 10)
    return value >= 0 && value <= 5
  } catch (_) {
    return false
  }
}

const validateSingleChoice = (data: string, question: Question) => {
  if (question.type !== 'SINGLE_CHOICE') return false

  try {
    if (!question.required && data === '') return true
    return question.data.options.map(opt => opt.id).includes(parseInt(data, 10))
  } catch (_) {
    return false
  }
}

const validateMultiChoice = (data: string[], question: Question) => {
  if (question.type !== 'MULTIPLE_CHOICE') return false

  try {
    if (!question.required) return true
    let valid = true
    const ids = question.data.options.map(opt => opt.id)
    data.forEach(id => {
      valid = valid && ids.includes(parseInt(id, 10))
    })
    return valid
  } catch (_) {
    return false
  }
}

const mapTypeToValidator: Record<string, (data: any, question: Question) => boolean> = {
  LIKERT: validateLikertQuestion,
  SINGLE_CHOICE: validateSingleChoice,
  MULTIPLE_CHOICE: validateMultiChoice,
}

export const validateFeedback = async (data: QuestionAnswer[], feedbackTarget: FeedbackTarget) => {
  try {
    const surveys = await getFeedbackTargetSurveys(feedbackTarget)
    feedbackTarget.populateQuestions(surveys)
    const idToQuestion: Record<number, Question> = {}
    feedbackTarget.questions.forEach(q => {
      const question = q as Question
      if (question.type === 'TEXT') return

      idToQuestion[question.id] = question
    })
    let valid = true
    const answerIds = new Set<number>()
    data.forEach(answer => {
      const question = idToQuestion[answer.questionId]
      const validator = mapTypeToValidator[question.type]
      if (!validator) return
      answerIds.add(answer.questionId)
      if (!validator(answer.data, question)) {
        valid = false
      }
    })
    feedbackTarget.questions.forEach(q => {
      if (q.required && mapTypeToValidator[q.type] && !answerIds.has(q.id)) {
        valid = false
      }
    })
    return valid
  } catch (e) {
    return false
  }
}
