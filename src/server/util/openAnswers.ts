import type { QuestionAnswer } from '@common/types/question'

export const setOpenAnswersHidden = (data: QuestionAnswer[], questionId: number, content: string, hidden: boolean) => {
  let matchedCount = 0
  let changedCount = 0

  const updatedData = data.map(answer => {
    if (answer.data === content && answer.questionId === questionId) {
      matchedCount += 1

      const isCurrentlyHidden = answer.hidden === true
      if (isCurrentlyHidden !== hidden) {
        changedCount += 1
        return { ...answer, hidden }
      }
    }
    return answer
  })

  return { data: updatedData, matchedCount, changedCount }
}

export const removeOpenAnswers = (data: QuestionAnswer[], questionId: number, content: string) => {
  let removed = false

  const updatedData = data.filter(answer => {
    if (answer.data === content && answer.questionId === questionId) {
      removed = true
      return false
    }
    return true
  })

  return { data: updatedData, removed }
}
