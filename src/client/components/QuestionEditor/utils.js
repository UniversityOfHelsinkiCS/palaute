import { v4 as uuidv4 } from 'uuid'

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

export const createQuestion = (type) => {
  const data = createQuestionData(type)

  return {
    type,
    data,
  }
}

export const createOption = () => ({
  id: uuidv4(),
  label: createTranslationObject(),
})
