import React, { useMemo } from 'react'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'

import { Typography, List } from '@material-ui/core'

import RealisationFeedbackTargets from './RealisationFeedbackTargets'
import useFeedbackTargets from '../../hooks/useFeedbackTargets'
import {
  getCourseRealisationsWithFeedbackTargets,
  sortCourseRealisations,
} from '../UserFeedbacks/utils'

const FeedbackTargetList = () => {
  const courseId = useParams().id

  const data = useFeedbackTargets(courseId)

  const { t } = useTranslation()

  const feedbackTargets = !data.isLoading && data.feedbackTargets

  const courseRealisations = useMemo(
    () => getCourseRealisationsWithFeedbackTargets(feedbackTargets),
    [feedbackTargets],
  )

  const sortedCourseRealations = useMemo(
    () => sortCourseRealisations(courseRealisations),
    [courseRealisations],
  )

  return (
    <div>
      <Typography variant="h4" component="h3">
        {t('feedbackTargets:title')}
      </Typography>
      <List>
        {sortedCourseRealations.length > 0 &&
          sortedCourseRealations.map((target) => (
            <RealisationFeedbackTargets key={target.id} realisation={target} />
          ))}
      </List>
    </div>
  )
}

export default FeedbackTargetList
