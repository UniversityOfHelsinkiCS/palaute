import type { LocalizedString } from './common'
import type { Tag } from './organisation'

export type CourseUnitOrganisation = {
  type: string
  noFeedbackAllowed: boolean
}

export type CourseUnitOrg = {
  courseUnitOrganisation: CourseUnitOrganisation
}

export type CourseUnit = {
  id: string
  name: LocalizedString
  courseCode: string
  notGivingFeedback: boolean
  organisations: CourseUnitOrg[]
  tags?: Tag[]
}
