import { CourseUnit } from './CourseUnit'
import { UserFeedbackTarget } from './UserFeedbackTarget'

export interface FeedbackTarget {
  courseUnit: CourseUnit
  userFeedbackTargets: UserFeedbackTarget[]
}
