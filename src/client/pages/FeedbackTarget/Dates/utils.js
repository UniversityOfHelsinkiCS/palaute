import { isAfter, differenceInDays, startOfDay, isSameDay } from 'date-fns'
import { isNaN } from 'lodash-es'

import feedbackTargetIsOpen from '../../../util/feedbackTargetIsOpen'

export const validateFeedbackPeriod = (isOpen, isOver) => values => {
  const { closesAt, opensAt } = values

  const errors = {}

  if (!closesAt) {
    errors.closesAt = 'validationErrors:required'
  }
  if (isNaN(Date.parse(closesAt))) {
    errors.closesAt = 'validationErrors:invalidDate'
    return errors
  }

  if (!opensAt) {
    errors.opensAt = 'validationErrors:required'
  }
  if (isNaN(Date.parse(opensAt))) {
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
    errors.closesAt = 'editFeedbackTarget:closesAtInPastError'
  }

  if (opensAt && closesAt && Math.abs(differenceInDays(opensAt, closesAt)) < 1) {
    errors.closesAt = 'editFeedbackTarget:tooShortFeedbackPeriodError'
  }

  return errors
}

const opensAtIsImmediately = values => {
  const { opensAt } = values

  return startOfDay(opensAt).getTime() === startOfDay(new Date()).getTime()
}

// The confirmation warns that the feedback is about to open. That only applies when this save
// is what opens it: if opensAt was already today, the user is editing something else (the end
// date, say) and nothing new gets opened, so asking again would be noise.
export const requiresSubmitConfirmation = (values, initialValues) =>
  opensAtIsImmediately(values) && !isSameDay(values.opensAt, initialValues.opensAt)

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
