import type { Question } from './question'

export interface Survey {
  id: number
  questionIds: number[]
  questions?: Question[]
}

// GET /surveys/university
export type GetUniversitySurveyResponse = Survey

// GET /surveys/university/versions
export type GetUniversitySurveyVersionsResponse = Survey[]

// GET /surveys/programme/:code
export type GetProgrammeSurveyResponse = Survey
