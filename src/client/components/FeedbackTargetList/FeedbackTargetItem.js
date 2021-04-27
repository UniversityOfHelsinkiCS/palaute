import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import {
  ListItemText,
  ListItem,
  Box,
  makeStyles,
  Button,
} from '@material-ui/core'

import { getLanguageValue } from '../../util/languageUtils'
import { formatDate } from './utils'

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

  const { id, closesAt, opensAt, name } = feedbackTarget

  const periodInfo = t('feedbackOpenPeriod', {
    opensAt: formatDate(opensAt),
    closesAt: formatDate(closesAt),
  })

  const translatedName = getLanguageValue(name, i18n.language)

  return (
    <ListItem className={classes.listItem} divider={divider} disableGutters>
      <ListItemText primary={translatedName} secondary={periodInfo} />
      <Box mt={2} display="flex">
        <Button
          component={Link}
          className={classes.action}
          variant="contained"
          color="primary"
          to={`/targets/${id}/edit`}
        >
          {t('feedbackTargetList:editSurvey')}
        </Button>
        <Button
          component={Link}
          className={classes.action}
          color="primary"
          to={`/${id}/edit`}
        >
          {t('feedbackTargetList:showSurvey')}
        </Button>
        <Button
          component={Link}
          className={classes.action}
          color="primary"
          to={`/targets/${id}/results`}
        >
          {t('feedbackTargetList:showFeedbacks')}
        </Button>
      </Box>
    </ListItem>
  )
}

export default FeedbackTargetItem
