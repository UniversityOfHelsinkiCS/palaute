import { useSnackbar } from 'notistack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from 'react-query'
import { useHistory, useParams } from 'react-router'
import { differenceInDays, format } from 'date-fns'
import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import FeedbackPeriodForm from './FeedbackPeriodForm'
import {
  getFeedbackPeriodInitialValues,
  openFeedbackImmediately,
  opensAtIsImmediately,
  saveFeedbackPeriodValues,
  closeCourseImmediately,
} from './utils'
import { LoadingProgress } from '../LoadingProgress'
import PublicQuestions from '../PublicQuestions'

const FeedbackTargetSettings = () => {
  const { id } = useParams()
  const history = useHistory()
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { feedbackTarget, isLoading } = useFeedbackTarget(id, {
    skipCache: true,
  })

  if (isLoading) {
    return <LoadingProgress />
  }

  const handleOpenFeedbackImmediately = async () => {
    try {
      await openFeedbackImmediately(feedbackTarget)
      history.replace(`/targets/${id}`)
      queryClient.refetchQueries(['feedbackTarget', id])
    } catch (e) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  const handleCloseImmediately = async () => {
    const currentDate = new Date()
    const difference = differenceInDays(
      currentDate,
      new Date(feedbackTarget.opensAt),
    )

    // eslint-disable-next-line no-alert
    const result = window.confirm(
      difference > 1
        ? t('feedbackTargetResults:closeImmediatelyConfirm')
        : t('feedbackTargetResults:closeImmediatelyTomorrowConfirm', {
            date: format(
              currentDate.setDate(currentDate.getDate() + 1),
              'dd.MM.yyyy',
            ),
          }),
    )

    if (result) {
      try {
        await closeCourseImmediately(feedbackTarget, difference)
        window.location.reload()
      } catch (e) {
        enqueueSnackbar(t('unknownError'), { variant: 'error' })
      }
    }
  }

  const handleSubmitFeedbackPeriod = async (values) => {
    try {
      await saveFeedbackPeriodValues(values, feedbackTarget)

      enqueueSnackbar(t('saveSuccess'), { variant: 'success' })

      if (opensAtIsImmediately(values)) {
        history.replace(`/targets/${id}`)
      }

      queryClient.refetchQueries(['feedbackTarget', id])
    } catch (e) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  const feedbackPeriodInitialValues =
    getFeedbackPeriodInitialValues(feedbackTarget)

  return (
    <>
      <FeedbackPeriodForm
        onSubmit={handleSubmitFeedbackPeriod}
        initialValues={feedbackPeriodInitialValues}
        onOpenImmediately={handleOpenFeedbackImmediately}
        onCloseImmediately={handleCloseImmediately}
        feedbackTarget={feedbackTarget}
      />
      <PublicQuestions feedbackTarget={feedbackTarget} />
    </>
  )
}

export default FeedbackTargetSettings
