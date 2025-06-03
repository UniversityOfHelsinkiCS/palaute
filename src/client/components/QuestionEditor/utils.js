import { v4 as uuidv4 } from 'uuid'

const TEMP_ID = Symbol('tempId')

const createTranslationObject = () => ({
  fi: '',
  sv: '',
  en: '',
})

/**
 *
 * @param {string} type
 * @returns
 */
const createQuestionData = type => {
  switch (type) {
    case 'LIKERT':
      return {
        label: createTranslationObject(),
      }
    case 'MULTIPLE_CHOICE':
      return {
        label: createTranslationObject(),
        options: [],
      }
    case 'SINGLE_CHOICE':
      return {
        label: createTranslationObject(),
        options: [],
      }
    case 'OPEN':
      return {
        label: createTranslationObject(),
      }
    case 'TEXT':
      return {
        content: createTranslationObject(),
      }
    default:
      return null
  }
}

export const getQuestionId = question => (question ? (question.id ?? question[TEMP_ID]) : undefined)

/**
 *
 * @returns question data
 */
export const createQuestion = ({ type, data = createQuestionData(type), options = {} }) => ({
  [TEMP_ID]: uuidv4(),
  type,
  data,
  required: false,
  editable: true,
  public: type !== 'OPEN' && type !== 'TEXT',
  publicityConfigurable: type !== 'OPEN' && type !== 'TEXT',
  ...options,
})

export const copyQuestion = question => {
  const { id, ...rest } = question

  return {
    ...rest,
    [TEMP_ID]: uuidv4(),
  }
}

export const createOption = () => ({
  id: uuidv4(),
  label: createTranslationObject(),
})

export const questionCanMoveUp = (questions, index) => {
  if (index === 0) {
    return false
  }

  const previousQuestion = questions[index - 1]

  return previousQuestion?.editable ?? true
}

export const questionCanMoveDown = (questions, index) => {
  if (index === questions.length - 1) {
    return false
  }

  const nextQuestion = questions[index + 1]

  return nextQuestion?.editable ?? true
}

export const validateQuestions = values => {
  const { questions } = values

  const editableQuestions = questions.filter(({ editable }) => editable)

  for (const question of editableQuestions) {
    if (question.type === 'SINGLE_CHOICE' || question.type === 'MULTIPLE_CHOICE') {
      if (!question.data.options || question.data.options.length < 1) return false
    }
  }
  return true
}

export const copyQuestionsFromFeedbackTarget = feedbackTarget => {
  const questions = feedbackTarget.surveys?.teacherSurvey?.questions ?? []

  return questions.map(q => ({
    ...copyQuestion(q),
    editable: true,
  }))
}

export const getOrganisationSurveyCourseUnit = surveys => {
  if (!surveys || surveys.length === 0) return null

  return surveys[0]?.courseUnit ?? null
}

export const copyQuestionsFromUniversitySurvey = survey => {
  const questions = survey?.questions ?? []

  return questions.map(q => ({
    ...copyQuestion(q),
    editable: true,
  }))
}
