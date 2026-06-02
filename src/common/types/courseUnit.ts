import type { LocalizedString } from './common'
import type { Tag } from './organisation'

export type CourseUnitOrganisation = {
  type: string
  noFeedbackAllowed: boolean
}

// Minimal base for FeedbackTarget context (organisations typed per-context when that work is done)
export type CourseUnit = {
  id: string
  name: LocalizedString
  courseCode: string
  notGivingFeedback?: boolean
}

// GET /course-units/for-organisation/:code
export type GetCourseUnitsByOrganisationResponse = Array<{
  id: string
  name: LocalizedString
  courseCode: string
  tags?: Tag[]
}>

type TeacherCourseRealisationStats = {
  id: string
  name: LocalizedString
  startDate: string
  endDate: string
  userCreated: boolean
  feedbackResponseGiven: boolean
  feedbackResponseSent: boolean | null
  feedbackCount: number
  studentCount: number
  feedbackTarget: {
    id: number
    name: LocalizedString
    opensAt: string
    closesAt: string
    continuousFeedbackEnabled: boolean
    userCreated: boolean
  }
}

// GET /course-units/responsible
export type GetCourseUnitsResponsibleResponse = Array<{
  courseCode: string
  name: LocalizedString
  userCreated: boolean
  ongoingCourseRealisation: TeacherCourseRealisationStats | null
  upcomingCourseRealisation: TeacherCourseRealisationStats | null
  endedCourseRealisation: TeacherCourseRealisationStats | null
}>
