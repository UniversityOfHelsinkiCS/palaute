import type { LocalizedString } from './common'
import type { User } from './user'
import type { CourseUnit } from './courseUnit'
import type { Question } from './question'

export type CourseRealisation = {
  id: string
  name: LocalizedString
  startDate: string
  endDate: string
  userCreated?: boolean
}

export type UserFeedbackTarget = {
  id: number
  userId: string
  feedbackTargetId: number
  accessStatus: string
  isAdministrativePerson?: boolean
  groupIds?: string[]
  notGivingFeedback?: boolean
  user?: User
  feedback?: { id: number; createdAt: string; data: unknown } | null
}

export type FeedbackTargetGroup = {
  id: string
  name: LocalizedString
  teachers?: User[]
  studentCount?: number
}

// GET /feedback-targets/:id
export type GetFeedbackTargetResponse = {
  id: number
  courseUnitId: string
  courseRealisationId: string
  hidden: boolean
  feedbackType: string
  userCreated: boolean
  opensAt: string
  closesAt: string
  name: LocalizedString
  courseUnit: CourseUnit & { organisations?: unknown[]; tags?: unknown[] }
  courseRealisation: CourseRealisation & { tags?: unknown[] }
  userFeedbackTargets: UserFeedbackTarget[]
  groups?: FeedbackTargetGroup[]
  tags?: unknown[]
  administrativePersons?: User[]
  responsibleTeachers?: User[]
  teachers?: User[]
  summary?: unknown
  studentListVisible?: boolean
  feedbackCanBeGiven?: boolean
  surveys?: unknown
  publicQuestionIds?: number[]
  publicityConfigurableQuestionIds?: number[]
  accessStatus: string[]
  feedback?: unknown
  groupIds?: string[]
}

// GET /feedback-targets/for-course-realisation/:id
export type GetFeedbackTargetsForCourseRealisationResponse = Array<{
  id: number
  feedbackType: string
}>

// GET /feedback-targets/for-course-unit/:code
export type GetFeedbackTargetsForCourseUnitResponse = Array<{
  id: number
  name: LocalizedString
  opensAt: string
  closesAt: string
  feedbackType: string
  courseRealisation: CourseRealisation
  courseUnit: CourseUnit
  feedbackResponse?: string | null
  continuousFeedbackEnabled: boolean
  questions?: Question[]
  surveys?: unknown
  userCreated: boolean
  studentCount: number
  feedbackResponseGiven: boolean
  feedbackResponseSent: boolean | null
}>

// GET /feedback-targets/:id/error-view-details
export type GetFeedbackTargetErrorViewDetailsResponse = {
  id: number
  name: LocalizedString
  userCreated: boolean
  opensAt: string
  closesAt: string
  courseUnit: {
    id: string
    name: LocalizedString
    courseCode: string
    userCreated: boolean
  }
  courseRealisation: {
    id: string
    name: LocalizedString
    userCreated: boolean
    startDate: string
    endDate: string
  }
}

// GET /feedback-targets/:id/feedbacks
export type GetFeedbackTargetFeedbacksResponse = {
  feedbacks: Array<{
    id: number
    createdAt: string
    updatedAt: string
    data: Array<{ questionId: number; data: string | string[]; hidden?: boolean }>
  }>
  feedbackVisible: boolean
  accessStatus: unknown
  groupsAvailable?: boolean
  studentCount?: number
}

// GET /feedback-targets/:id/logs
export type GetFeedbackTargetLogsResponse = Array<{
  id: number
  data: Record<string, unknown>
  feedbackTargetId: string
  userId: string
  createdAt: string
  updatedAt: string
  user?: User
}>

// GET /feedback-targets/:id/users
export type GetFeedbackTargetUsersResponse = Array<{
  firstName?: string
  lastName?: string
  studentNumber?: string
  token: string
}>

// GET /feedback-targets/:id/students-with-feedback
export type GetStudentsWithFeedbackResponse = Array<User & { feedbackGiven?: boolean }>

type FeedbackTargetForStudent = {
  id: number
  name: LocalizedString
  opensAt: string
  closesAt: string
  feedbackType: string
  accessStatus: string
  feedback?: unknown
  courseUnit: CourseUnit & { organisations?: unknown[] }
  courseRealisation: CourseRealisation
  userFeedbackTargets: UserFeedbackTarget[]
  summary?: unknown
}

// GET /feedback-targets/for-student
export type GetFeedbackTargetsForStudentResponse = {
  waiting: FeedbackTargetForStudent[]
  given: FeedbackTargetForStudent[]
  ended: FeedbackTargetForStudent[]
  ongoing: FeedbackTargetForStudent[]
}

// GET /courses (noad)
export type GetNoadCoursesResponse = Array<{
  id: number
  name: LocalizedString
  opensAt: string
  closesAt: string
  feedbackType: string
  userFeedbackTargets: UserFeedbackTarget[]
  courseUnit: CourseUnit & { organisations?: unknown[] }
  courseRealisation: CourseRealisation
}>

// GET /continuous-feedback/:feedbackTargetId
export type GetContinuousFeedbacksResponse = Array<{
  id: number
  data: Record<string, unknown>
  userId: string
  feedbackTargetId: number
  sendInDigestEmail: boolean
  response?: string | null
  responseEmailSent: boolean
  createdAt: string
  updatedAt: string
}>
