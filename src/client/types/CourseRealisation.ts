import type { LocalizedString } from '@common/types/common'

export type CourseRealisation = {
  id: string
  name: LocalizedString
  startDate: string
  endDate: string
  studentCount?: number // used in CourseSearchInput to show student counts
}
