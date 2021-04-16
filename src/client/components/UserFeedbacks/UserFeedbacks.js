import React, { Fragment } from 'react'
import { Typography, List, Divider } from '@material-ui/core'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from 'react-query'

import FeedbackListItem from './FeedbackListItem'
import useUserFeedbackTargetsForStudent from '../../hooks/useUserFeedbackTargetsForStudent'

import apiClient from '../../util/apiClient'

const feedbackTargetSortFn = (a, b) => {
  if (
    a.feedbackId &&
    b.feedbackId &&
    a.courseRealisation &&
    b.courseRealisation
  ) {
    return a.feedbackTarget.courseRealisation.endDate <
      b.feedbackTarget.courseRealisation.endDate
      ? -1
      : 1
  }
  if (a.feedbackId) {
    return 1
  }
  if (b.feedbackId) {
    return -1
  }
  return a.feedbackTarget.courseRealisation.id <
    b.feedbackTarget.courseRealisation.id
    ? -1
    : 1
}

const makeDeletePath = (userFeedbackTarget) => {
  const { feedbackId } = userFeedbackTarget

  return feedbackId ? `/feedbacks/${feedbackId}` : null
}

const UserFeedbacks = () => {
  const { t } = useTranslation()
  const { userFeedbackTargets } = useUserFeedbackTargetsForStudent()

  const queryClient = useQueryClient()

  const deleteMutation = useMutation('delete', {
    mutationFn: (courseId) => apiClient.delete(makeDeletePath(courseId)),
    onSuccess: (_, courseId) => {
      queryClient.setQueryData('userFeedback', (old) =>
        old.filter((answer) => answer.courseRealisationId !== courseId),
      )
    },
  })

  const onDelete = async (userFeedbackTarget) => {
    await deleteMutation.mutate(userFeedbackTarget.feedbackId)
  }

  if (!userFeedbackTargets) {
    return null
  }

  userFeedbackTargets.sort(feedbackTargetSortFn)

  return (
    <div>
      <Typography variant="h4">{t('userFeedbacks:mainHeading')}</Typography>
      <List>
        {userFeedbackTargets.map((userFeedbackTarget) => (
          <Fragment key={userFeedbackTarget.id}>
            <FeedbackListItem
              userFeedbackTarget={userFeedbackTarget}
              onDelete={() => onDelete(userFeedbackTarget)}
            />
            <Divider component="li" />
          </Fragment>
        ))}
      </List>
    </div>
  )
}

export default UserFeedbacks
