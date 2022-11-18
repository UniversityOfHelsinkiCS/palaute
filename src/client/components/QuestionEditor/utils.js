import { v4 as uuidv4 } from 'uuid'

const TEMP_ID = Symbol('tempId')

const createTranslationObject = () => ({
  fi: '',
  sv: '',
  en: '',
})

const createQuestionData = (type) => {
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

export const getQuestionId = (question) => question.id ?? question[TEMP_ID]

export const createQuestion = (type) => {
  const data = createQuestionData(type)

  return {
    [TEMP_ID]: uuidv4(),
    type,
    data,
    required: false,
    editable: true,
    public: true,
    publicityConfigurable: true,
  }
}

export const copyQuestion = (question) => {
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
