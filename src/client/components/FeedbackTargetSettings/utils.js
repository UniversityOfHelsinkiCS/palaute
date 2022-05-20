import {
  isAfter,
  differenceInDays,
  startOfDay,
  endOfDay,
  format,
  set,
} from 'date-fns'

import apiClient from '../../util/apiClient'
import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'

export const openFeedbackImmediately = async (feedbackTarget) => {
  const { id } = feedbackTarget
  const opensAt = new Date()

  const payload = {
    opensAt,
  }

  const { data } = await apiClient.put(
    `/feedback-targets/${id}/open-immediately`,
    payload,
  )

  return data
}

export const validateFeedbackPeriod = (values) => {
  const { closesAt, opensAt } = values

  const errors = {}

  if (!closesAt) {
    errors.closesAt = 'validationErrors.required'
  }

  if (!opensAt) {
    errors.opensAt = 'validationErrors.required'
  }

  if (startOfDay(opensAt) < startOfDay(new Date())) {
    errors.opensAt = 'editFeedbackTarget:opensAtInPastError'
  }

  if (!isAfter(closesAt, opensAt)) {
    errors.closesAt = 'editFeedbackTarget:closesAtBeforeOpensAtError'
  }

  if (
    opensAt &&
    closesAt &&
    Math.abs(differenceInDays(opensAt, closesAt)) < 1
  ) {
    errors.closesAt = 'editFeedbackTarget:tooShortFeedbackPeriodError'
  }

  return errors
}

export const opensAtIsImmediately = (values) => {
  const { opensAt } = values

  return startOfDay(opensAt).getTime() === startOfDay(new Date()).getTime()
}

export const requiresSubmitConfirmation = (values) =>
  opensAtIsImmediately(values)

export const getFeedbackPeriodInitialValues = (feedbackTarget) => {
  const { closesAt, opensAt } = feedbackTarget

  return {
    opensAt: new Date(opensAt),
    closesAt: new Date(closesAt),
  }
}

export const saveFeedbackPeriodValues = async (values, feedbackTarget) => {
  const closesAt = values.closesAt ? endOfDay(new Date(values.closesAt)) : null
  const opensAt = values.opensAt ? startOfDay(new Date(values.opensAt)) : null

  const { surveys, id } = feedbackTarget
  const { id: surveyId } = surveys.teacherSurvey

  const payload = {
    surveyId,
    closesAt,
    opensAt,
  }

  const { data } = await apiClient.put(`/feedback-targets/${id}`, payload)

  return data
}

export const feedbackTargetIsOpenOrClosed = (feedbackTarget) => {
  const closesAt = new Date(feedbackTarget.closesAt)

  return new Date() > closesAt || feedbackTargetIsOpen(feedbackTarget)
}

export const closeCourseImmediately = async (feedbackTarget, difference) => {
  const currentDate = new Date()
  const { id } = feedbackTarget
  const closesAt =
    difference > 1
      ? currentDate
      : set(currentDate, {
          date: currentDate.getDate() + 1,
          hours: 23,
          minutes: 59,
        })

  const payload = {
    closesAt,
  }

  const { data } = await apiClient.put(
    `/feedback-targets/${id}/close-immediately`,
    payload,
  )

  return data
}

export const feedbackCanBeClosed = (feedbackTarget) => {
  const { opensAt } = feedbackTarget
  const openTime = new Date() - new Date(opensAt)

  return openTime >= 86400000
}

export const formatClosesAt = (closesAt) =>
  format(new Date(closesAt), 'dd.MM.yyyy')
