import React, { useMemo, Fragment } from 'react'
import { Typography, Alert } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import qs from 'qs'

import useFeedbackTargetsForStudent from '../../hooks/useFeedbackTargetsForStudent'
import CourseRealisationItem from './CourseRealisationItem'

import { filterFeedbackTargets, getCourseRealisationsWithFeedbackTargets, sortCourseRealisations } from './utils'
import { LoadingProgress } from '../../components/common/LoadingProgress'
import Title from '../../components/common/Title'
import { StatusTabs, StatusTab } from '../../components/common/StatusTabs'

const MyFeedbacks = () => {
  const location = useLocation()

  const { status = 'waiting' } = qs.parse(location.search, {
    ignoreQueryPrefix: true,
  })

  const { t } = useTranslation()
  const { feedbackTargets, isLoading } = useFeedbackTargetsForStudent()

  const filteredFeedbackTargets = useMemo(() => filterFeedbackTargets(feedbackTargets), [feedbackTargets])

  const sortedCourseRealisations = useMemo(
    () =>
      sortCourseRealisations(
        getCourseRealisationsWithFeedbackTargets(filteredFeedbackTargets[status] ?? filterFeedbackTargets.waiting)
      ),
    [filteredFeedbackTargets, status]
  )

  const showNoFeedbackAlert = !isLoading && sortedCourseRealisations.length === 0
  const counts = {
    ongoing: filteredFeedbackTargets.ongoing?.length,
    waiting: filteredFeedbackTargets.waiting?.length,
    given: filteredFeedbackTargets.given?.length,
    ended: filteredFeedbackTargets.ended?.length,
  }

  const tabOrder = ['waiting', 'given', 'ended']
  if (counts.ongoing && !tabOrder.includes('ongoing')) tabOrder.unshift('ongoing')

  const getPageTitle = () => {
    const baseTitle = t('userFeedbacks:mainHeading')

    switch (status) {
      case 'ongoing':
        return `${t('userFeedbacks:continuousFeedbackTab')} | ${baseTitle}`
      case 'waiting':
        return `${t('userFeedbacks:waitingForFeedbackTab')} | ${baseTitle}`
      case 'given':
        return `${t('userFeedbacks:feedbackGivenTab')} | ${baseTitle}`
      case 'ended':
        return `${t('userFeedbacks:feedbackClosedTab')} | ${baseTitle}`
      default:
        return baseTitle
    }
  }

  return (
    <>
      <Title>{getPageTitle()}</Title>
      <Typography id="my-feedbacks-title" variant="h4" component="h1">
        {t('userFeedbacks:mainHeading')}
      </Typography>

      <StatusTabs aria-labelledby="my-feedbacks-title" status={status} tabOrder={tabOrder}>
        {counts.ongoing && (
          <StatusTab
            data-cy="my-feedbacks-continuous-tab"
            label={t('userFeedbacks:continuousFeedbackTab')}
            status="ongoing"
            count={counts.ongoing}
            badgeColor="primary"
          />
        )}
        <StatusTab
          data-cy="my-feedbacks-waiting-tab"
          label={t('userFeedbacks:waitingForFeedbackTab')}
          status="waiting"
          count={counts.waiting}
          badgeColor="primary"
        />
        <StatusTab data-cy="my-feedbacks-given-tab" label={t('userFeedbacks:feedbackGivenTab')} status="given" />
        <StatusTab data-cy="my-feedbacks-closed-tab" label={t('userFeedbacks:feedbackClosedTab')} status="ended" />
      </StatusTabs>

      {isLoading && <LoadingProgress />}

      {showNoFeedbackAlert && sortedCourseRealisations.length === 0 && (
        <Alert data-cy="my-feedbacks-no-feedbacks" severity="info">
          {t('userFeedbacks:noFeedback')}
        </Alert>
      )}

      {sortedCourseRealisations.map(courseRealisation => (
        <Fragment key={courseRealisation.id}>
          <CourseRealisationItem courseRealisation={courseRealisation} />
        </Fragment>
      ))}
    </>
  )
}

export default MyFeedbacks
