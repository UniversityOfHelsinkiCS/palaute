import type { Question } from './question'

export interface Survey {
  id: number
  questionIds: number[]
  questions?: Question[]
}
