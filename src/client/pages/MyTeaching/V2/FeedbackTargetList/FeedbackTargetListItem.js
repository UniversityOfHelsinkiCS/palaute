import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { parseISO } from 'date-fns'

import { ListItemText, ListItem, Typography, Link, Tooltip } from '@mui/material'

import FeedbackResponseChip from '../../FeedbackResponseChip'

import feedbackTargetIsOpen from '../../../../util/feedbackTargetIsOpen'
import feedbackTargetIsEnded from '../../../../util/feedbackTargetIsEnded'
import feedbackTargetIsOld from '../../../../util/feedbackTargetIsOld'
import feedbackTargetCourseIsOngoing from '../../../../util/feedbackTargetCourseIsOngoing'

import { getLanguageValue } from '../../../../util/languageUtils'
import { formatDate, getFeedbackPercentageString } from '../../utils'

const FeedbackTargetPeriodInfo = ({ feedbackTarget }) => {
  const { t } = useTranslation()

  const { courseRealisation, opensAt, closesAt, userCreated } = feedbackTarget
  const { startDate, endDate } = courseRealisation

  const feedbackPeriod = t('teacherView:surveyOpen', {
    closesAt: formatDate(closesAt),
    opensAt: formatDate(opensAt),
  })

  if (userCreated) return <Typography>{feedbackPeriod}</Typography>

  return (
    <Tooltip title={feedbackPeriod}>
      <Typography>
        {t('feedbackTargetView:coursePeriod')}: {formatDate(startDate)} - {formatDate(endDate)}
      </Typography>
    </Tooltip>
  )
}

const FeedbackTargetPrimaryText = ({ feedbackTarget }) => {
  const { i18n } = useTranslation()

  const {
    id,
    courseRealisation,
    continuousFeedbackEnabled,
    feedbackCount,
    feedbackResponseSent,
    feedbackResponseGiven,
  } = feedbackTarget
  const { name } = courseRealisation

  const isEnded = feedbackTargetIsEnded(feedbackTarget)
  const isOpen = feedbackTargetIsOpen(feedbackTarget)
  const isOld = feedbackTargetIsOld(feedbackTarget)
  const isOngoing = feedbackTargetCourseIsOngoing(feedbackTarget) && !isOpen

  const courseName = getLanguageValue(name, i18n.language)

  const fetchFeedbackResponseChip =
    isOpen || (isOngoing && continuousFeedbackEnabled) || (isEnded && (feedbackCount > 0 || feedbackResponseGiven))

  return (
    <>
      <Link
        data-cy={`my-teaching-feedback-target-item-link-${id}`}
        component={RouterLink}
        to={`/targets/${id}`}
        sx={{ marginRight: 2 }}
      >
        {courseName}
      </Link>
      {fetchFeedbackResponseChip && (
        <FeedbackResponseChip
          id={id}
          feedbackResponseGiven={feedbackResponseGiven}
          feedbackResponseSent={feedbackResponseSent}
          isOld={isOld}
          ongoing={isOpen}
          continuous={isOngoing && continuousFeedbackEnabled}
          data-cy={
            isOpen
              ? `feedbackOpen-${feedbackTarget.id}`
              : `feedbackResponseGiven-${feedbackTarget.id}-${feedbackResponseGiven}`
          }
        />
      )}
      <FeedbackTargetPeriodInfo feedbackTarget={feedbackTarget} />
    </>
  )
}

const FeedbackTargetSecondaryText = ({ feedbackTarget }) => {
  const { t } = useTranslation()

  const { feedbackCount, studentCount } = feedbackTarget

  const feedbackPercentage = getFeedbackPercentageString(feedbackTarget)

  return (
    <Typography variant="body2" color="textSecondary" component="span">
      {parseISO(feedbackTarget.opensAt) < new Date() ? (
        <>
          {t('teacherView:feedbackCount', {
            count: feedbackCount,
            totalCount: studentCount,
          })}{' '}
          ({feedbackPercentage})
        </>
      ) : (
        t('teacherView:feedbackNotStarted')
      )}
    </Typography>
  )
}

const FeedbackTargetListItem = ({ feedbackTarget, divider = true }) => {
  const { id } = feedbackTarget

  return (
    <ListItem divider={divider} data-cy={`my-teaching-feedback-target-item-${id}`}>
      <ListItemText
        disableTypography
        primary={<FeedbackTargetPrimaryText feedbackTarget={feedbackTarget} />}
        secondary={<FeedbackTargetSecondaryText feedbackTarget={feedbackTarget} />}
      />
    </ListItem>
  )
}

export default FeedbackTargetListItem
