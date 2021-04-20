const isEmpty = (value) => {
  if (Array.isArray(value)) {
    return value.length === 0
  }

  if (typeof value === 'number') {
    return false
  }

  return !value
}

export const makeValidate = (questions) => (values) => {
  const errors = {
    answers: {},
  }

  questions.forEach((question) => {
    const answer = values.answers[question.id]
    const hasError = question.required && isEmpty(answer)

    console.log(answer, hasError)

    if (hasError) {
      errors.answers[question.id] = 'validationErrors.required'
    }
  })

  return errors
}

const getInitialAnswerByType = (type) => {
  if (type === 'MULTIPLE_CHOICE') {
    return []
  }

  return ''
}

export const getInitialValuesFromFeedbackTarget = (feedbackTarget) => {
  const answers = feedbackTarget.questions.reduce(
    (acc, question) => ({
      ...acc,
      [question.id]: getInitialAnswerByType(question.type),
    }),
    {},
  )

  return { answers }
}
