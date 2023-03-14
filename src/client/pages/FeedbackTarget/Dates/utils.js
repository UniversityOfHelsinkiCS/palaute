import { isAfter, differenceInDays, startOfDay, format } from 'date-fns'
import _ from 'lodash'

import feedbackTargetIsOpen from '../../../util/feedbackTargetIsOpen'

export const validateFeedbackPeriod = (isOpen, isOver) => values => {
  const { closesAt, opensAt } = values

  const errors = {}

  if (!closesAt) {
    errors.closesAt = 'validationErrors:required'
  }
  if (_.isNaN(Date.parse(closesAt))) {
    errors.closesAt = 'validationErrors:invalidDate'
    return errors
  }

  if (!opensAt) {
    errors.opensAt = 'validationErrors:required'
  }
  if (_.isNaN(Date.parse(opensAt))) {
    errors.opensAt = 'validationErrors:invalidDate'
    return errors
  }

  if (startOfDay(opensAt) < startOfDay(new Date()) && !isOpen) {
    errors.opensAt = 'editFeedbackTarget:opensAtInPastError'
  }

  if (!isAfter(closesAt, opensAt)) {
    errors.closesAt = 'editFeedbackTarget:closesAtBeforeOpensAtError'
  }
  if (closesAt < new Date() && !isOver) {
    errors.closesAt = 'editFeedbackTarget:opensAtInPastError'
  }

  if (opensAt && closesAt && Math.abs(differenceInDays(opensAt, closesAt)) < 1) {
    errors.closesAt = 'editFeedbackTarget:tooShortFeedbackPeriodError'
  }

  return errors
}

export const opensAtIsImmediately = values => {
  const { opensAt } = values

  return startOfDay(opensAt).getTime() === startOfDay(new Date()).getTime()
}

export const requiresSubmitConfirmation = values => opensAtIsImmediately(values)

export const getFeedbackPeriodInitialValues = feedbackTarget => {
  const { closesAt, opensAt } = feedbackTarget

  return {
    opensAt: new Date(opensAt),
    closesAt: new Date(closesAt),
  }
}

export const feedbackTargetIsOpenOrClosed = feedbackTarget => {
  const closesAt = new Date(feedbackTarget.closesAt)

  return new Date() > closesAt || feedbackTargetIsOpen(feedbackTarget)
}

export const formatClosesAt = closesAt => format(new Date(closesAt), 'dd.MM.yyyy')
