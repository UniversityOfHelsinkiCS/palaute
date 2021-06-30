import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { parseISO } from 'date-fns'

import {
  ListItemText,
  ListItem,
  Typography,
  Link,
  Chip,
  Tooltip,
} from '@material-ui/core'

import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import feedbackTargetIsEnded from '../../util/feedbackTargetIsEnded'
import { formatDate } from './utils'
import FeedbackResponseChip from './FeedbackResponseChip'

const getChip = (feedbackTarget, t) => {
  const isEnded = feedbackTargetIsEnded(feedbackTarget)
  const isOpen = feedbackTargetIsOpen(feedbackTarget)
  const { feedbackResponse } = feedbackTarget
  const feedbackResponseGiven = Boolean(feedbackResponse)

  if (isEnded) {
    return (
      <FeedbackResponseChip feedbackResponseGiven={feedbackResponseGiven} />
    )
  }

  if (isOpen) {
    return (
      <Chip
        label={t('teacherView:feedbackOpen')}
        variant="outlined"
        size="small"
      />
    )
  }

  return null
}

const FeedbackTargetItem = ({ feedbackTarget, divider = true }) => {
  const { t } = useTranslation()

  const {
    id,
    feedbackCount,
    enrolledCount,
    courseRealisation,
    opensAt,
    closesAt,
  } = feedbackTarget

  const { startDate, endDate } = courseRealisation

  const periodInfo = (
    <Tooltip
      title={t('teacherView:surveyOpen', {
        closesAt: formatDate(closesAt),
        opensAt: formatDate(opensAt),
      })}
    >
      <Link component={RouterLink} to={`/targets/${id}`}>
        {formatDate(startDate)} - {formatDate(endDate)}
      </Link>
    </Tooltip>
  )

  const chip = getChip(feedbackTarget, t)

  return (
    <ListItem divider={divider}>
      <ListItemText
        disableTypography
        primary={<Typography>{periodInfo}</Typography>}
        secondary={
          <>
            <Typography variant="body2" color="textSecondary" component="span">
              {parseISO(feedbackTarget.opensAt) < new Date()
                ? t('teacherView:feedbackCount', {
                    count: feedbackCount,
                    totalCount: enrolledCount,
                  })
                : t('teacherView:feedbackNotStarted')}
            </Typography>{' '}
            {chip}
          </>
        }
      />
    </ListItem>
  )
}

export default FeedbackTargetItem
