import React from 'react'
import { useHistory } from 'react-router-dom'
import { Button } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { useTranslation } from 'react-i18next'

import FixedContainer from '../FixedContainer'
import LanguageSelect from '../LanguageSelect'

const useStyles = makeStyles((theme) => ({
  saveButton: {
    marginRight: theme.spacing(1),
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}))

const Toolbar = ({ previewLink, language, onLanguageChange }) => {
  const { t } = useTranslation()
  const classes = useStyles()
  const history = useHistory()

  const handleClick = (e) => {
    e.preventDefault()
    // eslint-disable-next-line no-alert
    const redirect = window.confirm(
      t('editFeedbackTarget:showPreviewConfirmation'),
    )
    if (redirect) {
      history.push(previewLink)
    }
    return false
  }

  return (
    <FixedContainer>
      <div className={classes.container}>
        <Button color="primary" variant="contained" onClick={handleClick}>
          {t('editFeedbackTarget:showPreview')}
        </Button>

        <LanguageSelect
          value={language}
          onChange={onLanguageChange}
          label={t('editFeedbackTarget:translationLanguage')}
        />
      </div>
    </FixedContainer>
  )
}

export default Toolbar
