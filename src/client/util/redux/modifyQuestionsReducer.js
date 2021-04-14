import buildAction from './util'

export const submitUpdates = (courseId, data) =>
  buildAction('questions', {
    url: `/courses/${courseId}/questions`,
    method: 'put',
    data: { data },
  })

export const getCourseQuestionsAction = (courseId) =>
  buildAction('questions', { url: `/courses/${courseId}/questions` })

export const toggleRequiredField = (index) => ({
  type: 'TOGGLE_REQUIRED',
  index,
})

export const changeTypeField = (index, newType) => ({
  type: 'CHANGE_TYPE',
  index,
  newType,
})

export const changeNameField = (index, name, lang) => ({
  type: 'CHANGE_NAME',
  index,
  name,
  lang,
})

export const deleteQuestionAction = (index) => ({
  type: 'DELETE_QUESTION',
  index,
})

export const addQuestionAction = (data) => ({
  type: 'ADD_QUESTION',
  data,
})

const returnToggled = (questions, index) => {
  const newQuestions = questions
  newQuestions[index].required = !newQuestions[index].required
  return newQuestions
}

const returnChangedType = (questions, index, type) => {
  const newQuestions = questions
  newQuestions[index].type = type
  return newQuestions
}

const returnChangedName = (questions, index, name, lang) => {
  const newQuestions = questions
  newQuestions[index].question[lang] = name
  return newQuestions
}

export default (state = { data: {}, pending: true }, action) => {
  switch (action.type) {
    case 'TOGGLE_REQUIRED':
      return {
        ...state,
        data: {
          questions: returnToggled(state.data.questions, action.index),
        },
      }
    case 'CHANGE_TYPE':
      return {
        ...state,
        data: {
          questions: returnChangedType(
            state.data.questions,
            action.index,
            action.newType,
          ),
        },
      }
    case 'CHANGE_NAME':
      return {
        ...state,
        data: {
          questions: returnChangedName(
            state.data.questions,
            action.index,
            action.name,
            action.lang,
          ),
        },
      }
    case 'ADD_QUESTION':
      return {
        ...state,
        data: {
          questions: state.data.questions.concat(action.data),
        },
      }
    case 'DELETE_QUESTION':
      return {
        ...state,
        data: {
          questions: state.data.questions.filter((q, i) => i !== action.index),
        },
      }
    default:
      return state
  }
}
