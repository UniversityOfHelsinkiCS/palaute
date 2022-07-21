import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@mui/material'
import { useTranslation } from 'react-i18next'

import FixedContainer from '../FixedContainer'
import LanguageSelect from '../LanguageSelect'

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}

const Toolbar = ({ editLink, language, onLanguageChange }) => {
  const { t } = useTranslation()

  return (
    <FixedContainer>
      <div sx={styles.container}>
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
