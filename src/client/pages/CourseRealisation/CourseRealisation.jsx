import { useSnackbar } from 'notistack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, Navigate } from 'react-router-dom'

import { LoadingProgress } from '../../components/common/LoadingProgress'
import useCourseRealisationFeedbackTargets from '../../hooks/useCourseRealisationFeedbackTargets'

const getCourseRealisationFeedbackTarget = feedbackTargets =>
  (feedbackTargets ?? []).find(({ feedbackType }) => feedbackType === 'courseRealisation')

const CourseRealisation = () => {
  const { id } = useParams()
  const { t } = useTranslation()
  const { feedbackTargets, isLoading } = useCourseRealisationFeedbackTargets(id)
  const { enqueueSnackbar } = useSnackbar()

  if (isLoading) {
    return <LoadingProgress />
  }

  const courseRealisationFeedbackTarget = getCourseRealisationFeedbackTarget(feedbackTargets)

  if (!courseRealisationFeedbackTarget) {
    enqueueSnackbar(t('courseRealisationFeedback:noFeedbackTarget'), {
      variant: 'error',
    })

    return <Navigate to="/" />
  }

  return <Navigate to={`/targets/${courseRealisationFeedbackTarget.id}/feedback`} />
}

export default CourseRealisation
