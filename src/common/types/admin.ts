import type { LocalizedString } from './common'

export type InactiveCourseRealisation = {
  id: string
  name: LocalizedString
  startDate: string
  endDate: string
  manuallyEnabled: boolean
}

// GET /admin/inactive-course-realisations
export type GetInactiveCourseRealisationsResponse = InactiveCourseRealisation[]

export type UpdaterStatus = {
  startedAt: string
  finishedAt: string | null
  status: string
  jobType: string
}

// GET /admin/updater-status
export type GetUpdaterStatusesResponse = UpdaterStatus[]

// GET /admin/emails
export type GetEmailsToBeSentResponse = {
  emails: unknown[]
  studentEmails: number
  teacherEmails: number
  teacherEmailCounts: unknown[]
  studentEmailCounts: unknown[]
}

// GET /norppa-feedback/count
export type GetNorppaFeedbackCountResponse = {
  count: number
}
