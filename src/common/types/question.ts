import type { LocalizedString } from './common'

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
  id: string
  label: LocalizedString
}

// Non-discriminated base — used where the Sequelize model (type: QuestionType) must be assignable
export type QuestionBase = {
  id: number
  type: QuestionType
  secondaryType: QuestionSecondaryType
  required: boolean
  data: QuestionData
}

// Discriminated union — use in client code for narrowing by type
export type Question = {
  id: number
  secondaryType: QuestionSecondaryType
  required: boolean
} & (
  | {
      type: Exclude<QuestionType, 'TEXT'>
      data: AnswerableQuestionData
    }
  | {
      type: 'TEXT'
      data: TextSectionData
    }
)

export type QuestionAnswer = {
  questionId: number
  data: string | string[]
  hidden?: boolean
}
