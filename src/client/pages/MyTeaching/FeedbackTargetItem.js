import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { parseISO } from 'date-fns'

import { ListItemText, ListItem, Typography, Link, Tooltip } from '@mui/material'

import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import feedbackTargetIsEnded from '../../util/feedbackTargetIsEnded'
import feedbackTargetIsOld from '../../util/feedbackTargetIsOld'
import { formatDate, getFeedbackPercentageString } from './utils'
import { getLanguageValue } from '../../util/languageUtils'

import FeedbackResponseChip from './FeedbackResponseChip'
import feedbackTargetCourseIsOngoing from '../../util/feedbackTargetCourseIsOngoing'

const getChip = feedbackTarget => {
  const isEnded = feedbackTargetIsEnded(feedbackTarget)
  const isOpen = feedbackTargetIsOpen(feedbackTarget)
  const isOld = feedbackTargetIsOld(feedbackTarget)
  const isOngoing = feedbackTargetCourseIsOngoing(feedbackTarget) && !isOpen
  const { id, feedbackResponseSent, feedbackResponseGiven, feedbackCount, continuousFeedbackEnabled } = feedbackTarget

  if (isOpen || (isOngoing && continuousFeedbackEnabled) || (isEnded && (feedbackCount > 0 || feedbackResponseGiven))) {
    return (
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
    )
  }

  return null
}

const FeedbackTargetItem = ({ feedbackTarget, divider = true }) => {
  const { i18n, t } = useTranslation()

  const { id, feedbackCount, studentCount, courseRealisation, opensAt, closesAt, userCreated } = feedbackTarget

  const feedbackPercentage = getFeedbackPercentageString(feedbackTarget)

  const { name, startDate, endDate } = courseRealisation

  const courseName = getLanguageValue(name, i18n.language)
  const feedbackPeriod = t('teacherView:surveyOpen', {
    closesAt: formatDate(closesAt),
    opensAt: formatDate(opensAt),
  })

  const periodInfo = (
    <Tooltip title={feedbackPeriod}>
      <Typography>
        {t('feedbackTargetView:coursePeriod')}: {formatDate(startDate)} - {formatDate(endDate)}
      </Typography>
    </Tooltip>
  )

  const chip = getChip(feedbackTarget)

  return (
    <ListItem divider={divider} data-cy={`my-teaching-feedback-target-item-${id}`}>
      <ListItemText
        disableTypography
        primary={
          <>
            <Link
              data-cy={`my-teaching-feedback-target-item-link-${id}`}
              component={RouterLink}
              to={`/targets/${id}`}
              underline="hover"
            >
              {courseName}{' '}
            </Link>
            {userCreated ? <Typography>{feedbackPeriod}</Typography> : periodInfo}
          </>
        }
        secondary={
          <>
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
            </Typography>{' '}
            {chip}
          </>
        }
      />
    </ListItem>
  )
}

export default FeedbackTargetItem
