import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { parseISO } from 'date-fns'

import { Box, ListItemText, ListItem, Typography, Link, Tooltip } from '@mui/material'

import FeedbackResponseChip from '../chips/FeedbackResponseChip'
import InterimFeedbackChip from '../chips/InterimFeedbackChip'

import feedbackTargetIsOpen from '../../../util/feedbackTargetIsOpen'
import feedbackTargetIsEnded from '../../../util/feedbackTargetIsEnded'
import feedbackTargetIsOld from '../../../util/feedbackTargetIsOld'
import feedbackTargetCourseIsOngoing from '../../../util/feedbackTargetCourseIsOngoing'

import { getLanguageValue } from '../../../util/languageUtils'
import { formatDate, getFeedbackPercentageString } from '../utils/utils'

const FeedbackTargetPeriodInfo = ({ feedbackTarget }) => {
  const { t } = useTranslation()

  const { id, courseRealisation, opensAt, closesAt, userCreated } = feedbackTarget
  const { startDate, endDate } = courseRealisation

  const feedbackPeriod = t('teacherView:surveyOpen', {
    closesAt: formatDate(closesAt),
    opensAt: formatDate(opensAt),
  })

  if (userCreated) return <Typography>{feedbackPeriod}</Typography>

  return (
    <Tooltip title={feedbackPeriod}>
      <Typography data-cy={`my-teaching-feedback-target-period-info-${id}`}>
        {t('feedbackTargetView:coursePeriod')}: {formatDate(startDate)} - {formatDate(endDate)}
      </Typography>
    </Tooltip>
  )
}

const FeedbackTargetPrimaryText = ({ feedbackTarget, fetchInterimFeedbackChip }) => {
  const { i18n } = useTranslation()

  const {
    id,
    courseRealisation,
    continuousFeedbackEnabled,
    feedbackCount,
    feedbackResponseSent,
    feedbackResponseGiven,
  } = feedbackTarget

  const isEnded = feedbackTargetIsEnded(feedbackTarget)
  const isOpen = feedbackTargetIsOpen(feedbackTarget)
  const isOld = feedbackTargetIsOld(feedbackTarget)
  const isOngoing = feedbackTargetCourseIsOngoing(feedbackTarget) && !isOpen
  const courseName = getLanguageValue(courseRealisation.name, i18n.language)

  const fetchFeedbackResponseChip =
    isOpen ||
    (isOngoing && continuousFeedbackEnabled) ||
    (isEnded && (feedbackCount > 0 || Boolean(feedbackResponseGiven)))

  return (
    <>
      <Link data-cy={`my-teaching-feedback-target-item-link-${id}`} component={RouterLink} to={`/targets/${id}`}>
        {courseName}
      </Link>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {fetchInterimFeedbackChip && <InterimFeedbackChip parentFeedbackTarget={feedbackTarget} />}
        {fetchFeedbackResponseChip && (
          <FeedbackResponseChip
            id={id}
            feedbackResponseGiven={feedbackResponseGiven}
            feedbackResponseSent={feedbackResponseSent}
            isOld={isOld}
            ongoing={isOpen}
            continuous={isOngoing && continuousFeedbackEnabled}
          />
        )}
      </Box>
      <FeedbackTargetPeriodInfo feedbackTarget={feedbackTarget} />
    </>
  )
}

const FeedbackTargetSecondaryText = ({ feedbackTarget }) => {
  const { t } = useTranslation()

  const { feedbackCount, studentCount } = feedbackTarget

  const feedbackPercentage = getFeedbackPercentageString(feedbackCount, studentCount)

  return (
    <Typography
      variant="body2"
      color="textSecondary"
      component="span"
      data-cy={`my-teaching-feedback-target-secondary-text-${feedbackTarget.id}`}
    >
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

const FeedbackTargetListItem = ({ feedbackTarget, fetchInterimFeedbackChip, divider = true }) => {
  const { id } = feedbackTarget

  return (
    <ListItem divider={divider} data-cy={`my-teaching-feedback-target-item-${id}`}>
      <ListItemText
        disableTypography
        primary={
          <FeedbackTargetPrimaryText
            feedbackTarget={feedbackTarget}
            fetchInterimFeedbackChip={fetchInterimFeedbackChip}
          />
        }
        secondary={<FeedbackTargetSecondaryText feedbackTarget={feedbackTarget} />}
      />
    </ListItem>
  )
}

export default FeedbackTargetListItem
