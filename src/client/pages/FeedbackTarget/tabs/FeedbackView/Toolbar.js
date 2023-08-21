import React from 'react'
import { Link } from 'react-router-dom'
import { Box, Button } from '@mui/material'
import { useTranslation } from 'react-i18next'

import FixedContainer from '../../../../components/common/FixedContainer'
import LanguageSelect from '../../../../components/common/LanguageSelect'

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}

const Toolbar = ({ showEdit, editLink, language, onLanguageChange }) => {
  const { t } = useTranslation()

  return (
    <FixedContainer>
      <Box sx={styles.container}>
        {showEdit ? (
          <Button color="primary" variant="contained" component={Link} to={editLink}>
            {t('feedbackView:editSurvey')}
          </Button>
        ) : (
          <div />
        )}

        <LanguageSelect value={language} onChange={onLanguageChange} label={t('feedbackView:translationLanguage')} />
      </Box>
    </FixedContainer>
  )
}

export default Toolbar
