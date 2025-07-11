import { LocalizedString } from '@common/types'

export type CourseRealisation = {
  id: string
  name: LocalizedString
  startDate: string
  endDate: string
  studentCount?: number // used in CourseSearchInput to show student counts
}
