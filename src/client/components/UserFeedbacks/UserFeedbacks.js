import React, { useMemo, Fragment } from 'react'
import { Typography, Alert } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import qs from 'qs'

import useFeedbackTargetsForStudent from '../../hooks/useFeedbackTargetsForStudent'
import CourseRealisationItem from './CourseRealisationItem'
import StatusTabs from './StatusTabs'

import {
  filterFeedbackTargets,
  getCourseRealisationsWithFeedbackTargets,
  sortCourseRealisations,
} from './utils'
import { LoadingProgress } from '../common/LoadingProgress'
import Title from '../common/Title'

const styles = {
  heading: {
    marginBottom: 2,
  },
  courseRealisationItem: {
    marginBottom: 3,
  },
  statusTabs: {
    marginBottom: 3,
  },
  progressContainer: {
    padding: (theme) => theme.spacing(4, 0),
    display: 'flex',
    justifyContent: 'center',
  },
}

const UserFeedbacks = () => {
  const location = useLocation()

  const { status = 'waiting' } = qs.parse(location.search, {
    ignoreQueryPrefix: true,
  })

  const { t } = useTranslation()
  const { feedbackTargets, isLoading } = useFeedbackTargetsForStudent()

  const filteredFeedbackTargets = useMemo(
    () => filterFeedbackTargets(feedbackTargets),
    [feedbackTargets],
  )

  const sortedCourseRealisations = useMemo(
    () =>
      sortCourseRealisations(
        getCourseRealisationsWithFeedbackTargets(
          filteredFeedbackTargets[status] ?? filterFeedbackTargets.waiting,
        ),
      ),
    [filteredFeedbackTargets, status],
  )

  const showNoFeedbackAlert =
    !isLoading && sortedCourseRealisations.length === 0

  return (
    <div>
      <Title>{t('feedbacks')}</Title>
      <Typography variant="h4" component="h1" sx={styles.heading}>
        {t('userFeedbacks:mainHeading')}
      </Typography>

      <StatusTabs
        sx={styles.statusTabs}
        status={status}
        counts={{
          ongoing: filteredFeedbackTargets.ongoing?.length,
          waiting: filteredFeedbackTargets.waiting?.length,
          given: filteredFeedbackTargets.given?.length,
          ended: filteredFeedbackTargets.ended?.length,
        }}
      />

      {isLoading && <LoadingProgress />}

      {showNoFeedbackAlert && sortedCourseRealisations.length === 0 && (
        <Alert severity="info">{t('userFeedbacks:noFeedback')}</Alert>
      )}

      {sortedCourseRealisations.map((courseRealisation) => (
        <Fragment key={courseRealisation.id}>
          <CourseRealisationItem
            sx={styles.courseRealisationItem}
            courseRealisation={courseRealisation}
          />
        </Fragment>
      ))}
    </div>
  )
}

export default UserFeedbacks
