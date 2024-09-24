import React from 'react'

import EditFeedbackTargetDates from '../Dates/EditFeedbackTarget'
import EditInterimFeedback from './EditInterimFeedback'
import EditOrganisationSurvey from './EditOrganisationSurvey'

const FeedbackTargetEdit = ({ isInterimFeedback, isOrganisationSurvey }) => {
  if (isInterimFeedback) {
    return <EditInterimFeedback />
  }

  if (isOrganisationSurvey) {
    return <EditOrganisationSurvey />
  }

  return <EditFeedbackTargetDates />
}

export default FeedbackTargetEdit
