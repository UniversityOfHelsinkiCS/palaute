import { CourseRealisation } from './CourseRealisation'
import { CourseUnit } from './CourseUnit'
import { Summary } from './Summary'
import { UserFeedbackTarget } from './UserFeedbackTarget'

export type FeedbackTarget = {
  id: number
  courseRealisationId: string
  courseRealisation: CourseRealisation
  courseUnit: CourseUnit
  userFeedbackTargets: UserFeedbackTarget[]
  summary?: Summary
}
