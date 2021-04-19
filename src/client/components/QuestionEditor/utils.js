import produce from 'immer'

const TEMP_ID = Symbol('tempId')

export const swapArrayItems = (array, indexA, indexB) =>
  produce(array, (draft) => {
    const temp = draft[indexA]

    draft[indexA] = draft[indexB]
    draft[indexB] = temp
  })

const createEmptyTranslationObject = () => ({
  fi: '',
  sv: '',
  en: '',
})

export const generateId = () => {
  const date = Date.now().toString(36)
  const random = Math.round(Math.random() * 10000).toString(36)

  return `${date}${random}`
}

export const getQuestionId = (question) => question.id ?? question[TEMP_ID]

const createEmptyQuestionData = (type) => {
  switch (type) {
    case 'LIKERT':
      return {
        label: createEmptyTranslationObject(),
      }
    case 'MULTIPLE_CHOICE':
      return {
        label: createEmptyTranslationObject(),
        options: [],
      }
    case 'SINGLE_CHOICE':
      return {
        label: createEmptyTranslationObject(),
        options: [],
      }
    case 'OPEN':
      return {
        label: createEmptyTranslationObject(),
      }
    case 'TEXT':
      return {
        content: createEmptyTranslationObject(),
      }
    default:
      return null
  }
}

export const createEmptyQuestion = (type) => {
  const tempId = generateId()
  const data = createEmptyQuestionData(type)

  return {
    [TEMP_ID]: tempId,
    type,
    data,
  }
}
