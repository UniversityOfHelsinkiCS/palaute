import React from 'react'
import { useParams, Redirect } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'

import useCourseRealisationFeedbackTargets from '../../hooks/useCourseRealisationFeedbackTargets'
import { LoadingProgress } from '../../components/common/LoadingProgress'

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

    return <Redirect to="/" />
  }

  return <Redirect to={`/targets/${courseRealisationFeedbackTarget.id}/feedback`} />
}

export default CourseRealisation
