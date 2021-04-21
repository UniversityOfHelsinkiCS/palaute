import React from 'react'
import { useHistory } from 'react-router'
import { useTranslation } from 'react-i18next'

import { Typography, makeStyles, Button } from '@material-ui/core'

import { parseDate } from './util'
import { getLanguageValue } from '../../util/languageUtils'

const useStyles = makeStyles(() => ({
  target: {
    paddingTop: 10,
  },
  button: {
    padding: 2,
    marginTop: 5,
    marginBottom: 5,
  },
}))

const FeedbackTarget = ({ target }) => {
  const { i18n, t } = useTranslation()

  const history = useHistory()
  const classes = useStyles()

  const handleClick = (e, id) => {
    e.preventDefault()

    history.push(`/targets/${id}/edit`)
  }

  return (
    <div className={classes.target}>
      <Typography variant="body1" component="p" className={classes.targetName}>
        {getLanguageValue(target.name, i18n.language)}
      </Typography>
      <Typography variant="body2" component="p">
        {`${t('feedbackTargets:feedbackOpen')}: 
          ${parseDate(target.opensAt)} - ${parseDate(target.closesAt)}`}
      </Typography>
      <Button
        onClick={(e) => handleClick(e, target.id)}
        className={classes.button}
        variant="contained"
        color="primary"
      >
        Edit
      </Button>
    </div>
  )
}

export default FeedbackTarget
