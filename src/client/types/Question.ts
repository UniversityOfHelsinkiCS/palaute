import { LocalizedString } from '@common/types'

type QuestionType = 'TEXT' | 'LIKERT' | 'OPEN' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE'

interface QuestionData {
  content?: LocalizedString
  label?: LocalizedString
  description?: LocalizedString
}

export interface Question {
  id: number
  type: QuestionType
  data: QuestionData
}
