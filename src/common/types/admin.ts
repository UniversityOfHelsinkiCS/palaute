import type { LocalizedString } from './common'

export type InactiveCourseRealisation = {
  id: string
  name: LocalizedString
  startDate: string
  endDate: string
  manuallyEnabled: boolean
}

export type UpdaterStatus = {
  startedAt: string
  finishedAt: string | null
  status: string
  jobType: string
}

export type EmailsToBeSent = {
  emails: unknown[]
  studentEmails: number
  teacherEmails: number
  teacherEmailCounts: unknown[]
  studentEmailCounts: unknown[]
}

export type NorppaFeedbackCount = {
  count: number
}
