import { v4 as uuidv4 } from 'uuid'

const TEMP_ID = Symbol('tempId')

const createTranslationObject = () => ({
  fi: '',
  sv: '',
  en: '',
})

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
    case 'GROUPING':
      return {
        label: createTranslationObject(),
        options: [],
      }
    default:
      return null
  }
}

const getOptionOverrides = type => {
  switch (type) {
    case 'LIKERT':
      return {}
    case 'MULTIPLE_CHOICE':
      return {}
    case 'SINGLE_CHOICE':
      return {}
    case 'OPEN':
      return {}
    case 'TEXT':
      return {}
    case 'GROUPING':
      return {
        public: false,
        publicityConfigurable: false,
        required: true,
      }
    default:
      return {}
  }
}

export const getQuestionId = question => question.id ?? question[TEMP_ID]

export const createQuestion = type => {
  const data = createQuestionData(type)
  const optionOverrides = getOptionOverrides(type)

  return {
    [TEMP_ID]: uuidv4(),
    type,
    data,
    required: false,
    editable: true,
    public: true,
    publicityConfigurable: true,
    ...optionOverrides,
  }
}

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
