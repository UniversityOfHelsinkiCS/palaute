import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'

import {
  ListItemText,
  ListItem,
  Box,
  makeStyles,
  Button,
} from '@material-ui/core'

import { getLanguageValue } from '../../util/languageUtils'
import { formatDate } from './utils'
import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import feedbackTargetIsEnded from '../../util/feedbackTargetIsEnded'

const useStyles = makeStyles((theme) => ({
  listItem: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  action: {
    '&:not(last-child)': {
      marginRight: theme.spacing(1),
    },
  },
}))

const FeedbackTargetItem = ({ feedbackTarget, divider }) => {
  const classes = useStyles()
  const { i18n, t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()

  const { id, closesAt, opensAt, name } = feedbackTarget

  const periodInfo = t('feedbackOpenPeriod', {
    opensAt: formatDate(opensAt),
    closesAt: formatDate(closesAt),
  })

  const isOpen = feedbackTargetIsOpen(feedbackTarget)
  const isEnded = feedbackTargetIsEnded(feedbackTarget)

  const translatedName = getLanguageValue(name, i18n.language)

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `${window.location.protocol}//${window.location.host}/palaute/targets/${id}/feedback`,
    )
    enqueueSnackbar(t('feedbackTargetList:copied'), { variant: 'info' })
  }

  return (
    <ListItem className={classes.listItem} divider={divider} disableGutters>
      <ListItemText primary={translatedName} secondary={periodInfo} />
      <Box mt={2} display="flex">
        {!isOpen && (
          <Button
            component={Link}
            className={classes.action}
            variant="contained"
            color="primary"
            to={`/targets/${id}/edit`}
          >
            {t('feedbackTargetList:editSurvey')}
          </Button>
        )}
        <Button
          component={Link}
          className={classes.action}
          color="primary"
          to={`/targets/${id}/feedback`}
        >
          {t('feedbackTargetList:showSurvey')}
        </Button>
        {isEnded && (
          <Button
            component={Link}
            className={classes.action}
            color="primary"
            to={`/targets/${id}/results`}
          >
            {t('feedbackTargetList:showFeedbacks')}
          </Button>
        )}
        <Button color="primary" onClick={handleCopy} className={classes.copy}>
          {t('feedbackTargetList:copyLink')}
        </Button>
      </Box>
    </ListItem>
  )
}

export default FeedbackTargetItem
