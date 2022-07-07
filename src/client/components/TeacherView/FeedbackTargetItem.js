import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { parseISO } from 'date-fns'

import {
  ListItemText,
  ListItem,
  Typography,
  Link,
  Tooltip,
} from '@mui/material'

import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import feedbackTargetIsEnded from '../../util/feedbackTargetIsEnded'
import feedbackTargetIsOld from '../../util/feedbackTargetIsOld'
import { formatDate, getFeedbackPercentageString } from './utils'
import { getLanguageValue } from '../../util/languageUtils'

import FeedbackResponseChip from './FeedbackResponseChip'
import FeedbackOpenChip from './FeedbackOpenChip'

const getChip = (feedbackTarget) => {
  const isEnded = feedbackTargetIsEnded(feedbackTarget)
  const isOpen = feedbackTargetIsOpen(feedbackTarget)
  const isOld = feedbackTargetIsOld(feedbackTarget)
  const { id, feedbackResponseSent, feedbackResponseGiven, feedbackCount } =
    feedbackTarget

  if (isEnded && (feedbackCount > 0 || feedbackResponseGiven)) {
    return (
      <FeedbackResponseChip
        id={id}
        feedbackResponseGiven={feedbackResponseGiven}
        feedbackResponseSent={feedbackResponseSent || isOld}
        data-cy={`feedbackResponseGiven-${feedbackTarget.id}-${feedbackResponseGiven}`}
      />
    )
  }

  if (isOpen) {
    return <FeedbackOpenChip />
  }

  return null
}

const FeedbackTargetItem = ({ feedbackTarget, divider = true }) => {
  const { i18n, t } = useTranslation()

  const {
    id,
    feedbackCount,
    enrolledCount,
    courseRealisation,
    opensAt,
    closesAt,
  } = feedbackTarget

  const feedbackPercentage = getFeedbackPercentageString(feedbackTarget)

  const { name, startDate, endDate } = courseRealisation

  const periodInfo = (
    <Tooltip
      title={t('teacherView:surveyOpen', {
        closesAt: formatDate(closesAt),
        opensAt: formatDate(opensAt),
      })}
    >
      <Typography>
        {t('feedbackTargetView:coursePeriod')}: {formatDate(startDate)} -{' '}
        {formatDate(endDate)}
      </Typography>
    </Tooltip>
  )

  const chip = getChip(feedbackTarget)

  return (
    <ListItem divider={divider} data-cy={`feedbackTargetItem-${id}`}>
      <ListItemText
        disableTypography
        primary={
          <>
            <Link
              component={RouterLink}
              to={`/targets/${id}`}
              underline="hover"
            >
              {getLanguageValue(name, i18n.language)}{' '}
            </Link>
            {periodInfo}
          </>
        }
        secondary={
          <>
            <Typography variant="body2" color="textSecondary" component="span">
              {parseISO(feedbackTarget.opensAt) < new Date() ? (
                <>
                  {t('teacherView:feedbackCount', {
                    count: feedbackCount,
                    totalCount: enrolledCount,
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
