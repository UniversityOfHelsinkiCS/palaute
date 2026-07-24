import type { CourseUnitOrganisation } from '@common/types/courseUnit'

type NoFeedbackAllowedParams = {
  courseUnit: {
    organisations: Array<{ courseUnitOrganisation: CourseUnitOrganisation }>
  }
}

const noFeedbackAllowed = ({ courseUnit }: NoFeedbackAllowedParams): boolean => {
  const { organisations } = courseUnit

  return organisations.some(
    org => org.courseUnitOrganisation.type === 'PRIMARY' && org.courseUnitOrganisation.noFeedbackAllowed === true
  )
}

export default noFeedbackAllowed
