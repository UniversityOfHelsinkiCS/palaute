const validateLikertQuestion = (data, question) => {
  try {
    if (!question.required && data === '') return true
    const value = parseInt(data, 10)
    return value >= 0 && value <= 5
  } catch (_) {
    return false
  }
}

const validateSingleChoice = (data, question) => {
  try {
    if (!question.required && data === '') return true
    return question.data.options.map((opt) => opt.id).includes(data)
  } catch (_) {
    return false
  }
}

const validateMultiChoice = (data, question) => {
  try {
    if (!question.required && data === []) return true
    let valid = true
    const ids = question.data.options.map((opt) => opt.id)
    data.forEach((id) => {
      valid = valid && ids.includes(id)
    })
    return valid
  } catch (_) {
    return false
  }
}

const mapTypeToValidator = {
  LIKERT: validateLikertQuestion,
  SINGLE_CHOICE: validateSingleChoice,
  MULTIPLE_CHOICE: validateMultiChoice,
}

const validateFeedback = async (data, feedbackTarget) => {
  try {
    await feedbackTarget.populateQuestions()
    const idToQuestion = {}
    feedbackTarget.questions.forEach((q) => {
      idToQuestion[q.id] = q
    })
    let valid = true
    const answerIds = new Set()
    data.forEach((answer) => {
      const question = idToQuestion[answer.questionId]
      const validator = mapTypeToValidator[question.type]
      if (!validator) return
      answerIds.add(answer.questionId)
      if (!validator(answer.data, question)) {
        valid = false
      }
    })
    feedbackTarget.questions.forEach((q) => {
      if (q.required && mapTypeToValidator[q.type] && !answerIds.has(q.id)) {
        valid = false
      }
    })
    return valid
  } catch (e) {
    return false
  }
}

module.exports = {
  validateFeedback,
}
