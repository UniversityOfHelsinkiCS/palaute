import { CourseRealisation } from './CourseRealisation'
import { CourseUnit } from './CourseUnit'
import { UserFeedbackTarget } from './UserFeedbackTarget'
import { Summary } from './Summary'

export type FeedbackTarget = {
  id: number
  courseRealisationId: string
  courseRealisation: CourseRealisation
  courseUnit: CourseUnit
  userFeedbackTargets: UserFeedbackTarget[]
  summary?: Summary
}
