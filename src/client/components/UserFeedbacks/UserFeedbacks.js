import React, { useMemo, Fragment } from 'react'
import { Typography, List, Divider } from '@material-ui/core'
import { useTranslation } from 'react-i18next'

import FeedbackListItem from './FeedbackListItem'
import useUserFeedbackTargetsForStudent from '../../hooks/useUserFeedbackTargetsForStudent'

import {
  getCourseRealisationsWithUserFeedbackTargerts,
  sortCourseRealisations,
} from './utils'

const UserFeedbacks = () => {
  const { t } = useTranslation()
  const { userFeedbackTargets } = useUserFeedbackTargetsForStudent()

  const courseRealisations = useMemo(
    () => getCourseRealisationsWithUserFeedbackTargerts(userFeedbackTargets),
    [userFeedbackTargets],
  )

  const sortedCourseRealations = useMemo(
    () => sortCourseRealisations(courseRealisations),
    [courseRealisations],
  )

  if (!userFeedbackTargets) {
    return null
  }

  return (
    <div>
      <Typography variant="h4">{t('userFeedbacks:mainHeading')}</Typography>
      <List>
        {sortedCourseRealations.map((courseRealisation) => (
          <Fragment key={courseRealisation.id}>
            <FeedbackListItem courseRealisation={courseRealisation} />
            <Divider component="li" />
          </Fragment>
        ))}
      </List>
    </div>
  )
}

export default UserFeedbacks
