import { CourseRealisation } from './CourseRealisation'
import { CourseUnit } from './CourseUnit'
import { UserFeedbackTarget } from './UserFeedbackTarget'

export type FeedbackTarget = {
  id: number
  courseRealisationId: string
  courseRealisation: CourseRealisation
  courseUnit: CourseUnit
  userFeedbackTargets: UserFeedbackTarget[]
}
