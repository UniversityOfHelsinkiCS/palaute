import { FeedbackTarget } from '../types/FeedbackTarget'
import { Organisation } from '../types/Organisation'

const noFeedbackAllowed = ({ courseUnit }: FeedbackTarget): boolean => {
  const { organisations }: { organisations: Organisation[] } = courseUnit

  return organisations.some(
    org => org.courseUnitOrganisation.type === 'PRIMARY' && org.courseUnitOrganisation.noFeedbackAllowed === true
  )
}

export default noFeedbackAllowed
