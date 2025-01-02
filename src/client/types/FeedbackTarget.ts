import { CourseRealisation } from './CourseRealisation'

export type FeedbackTarget = {
  id: number
  courseRealisationId: string
  courseRealisation: CourseRealisation
}
