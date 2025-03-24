import { LocalizedString } from './types'

export type QuestionType = 'TEXT' | 'LIKERT' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'OPEN'

export type QuestionSecondaryType = 'WORKLOAD' | 'GROUPING' | 'OTHER' | null

export type QuestionData = TextSectionData | AnswerableQuestionData

export type TextSectionData = {
  content: LocalizedString
}

export type AnswerableQuestionData = {
  label: LocalizedString
  description?: LocalizedString
  options?: QuestionOption[]
}

export type QuestionOption = {
  id: number
  label: LocalizedString
}
