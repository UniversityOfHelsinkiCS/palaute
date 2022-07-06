import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { useTranslation } from 'react-i18next'

import FixedContainer from '../FixedContainer'
import LanguageSelect from '../LanguageSelect'

const useStyles = makeStyles({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
})

const Toolbar = ({ editLink, language, onLanguageChange }) => {
  const { t } = useTranslation()
  const classes = useStyles()

  return (
    <FixedContainer>
      <div className={classes.container}>
        <Button
          color="primary"
          variant="contained"
          component={Link}
          to={editLink}
        >
          {t('feedbackView:editSurvey')}
        </Button>

        <LanguageSelect
          value={language}
          onChange={onLanguageChange}
          label={t('feedbackView:translationLanguage')}
        />
      </div>
    </FixedContainer>
  )
}

export default Toolbar
