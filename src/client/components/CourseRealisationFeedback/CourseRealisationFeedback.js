import React from 'react'
import { useParams, Redirect } from 'react-router-dom'
import { Box, CircularProgress } from '@material-ui/core'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'

import useCourseRealisationFeedbackTargets from '../../hooks/useCourseRealisationFeedbackTargets'

const getCourseRealisationFeedbackTarget = (feedbackTargets) =>
  (feedbackTargets ?? []).find(
    ({ feedbackType }) => feedbackType === 'courseRealisation',
  )

const CourseRealisationFeedback = () => {
  const { id } = useParams()
  const { t } = useTranslation()
  const { feedbackTargets, isLoading } = useCourseRealisationFeedbackTargets(id)
  const { enqueueSnackbar } = useSnackbar()

  if (isLoading) {
    return (
      <Box my={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    )
  }

  const courseRealisationFeedbackTarget =
    getCourseRealisationFeedbackTarget(feedbackTargets)

  if (!courseRealisationFeedbackTarget) {
    enqueueSnackbar(t('courseRealisationFeedback:noFeedbackTarget'), {
      variant: 'error',
    })

    return <Redirect to="/" />
  }

  return (
    <Redirect to={`/targets/${courseRealisationFeedbackTarget.id}/feedback`} />
  )
}

export default CourseRealisationFeedback
