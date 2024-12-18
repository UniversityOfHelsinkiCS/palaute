import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button } from '@mui/material'
import { useTranslation } from 'react-i18next'

import FixedContainer from '../../../../../components/common/FixedContainer'
import LanguageSelect from '../../../../../components/common/LanguageSelect'

const styles = {
  saveButton: {
    marginRight: theme => theme.spacing(1),
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}

const Toolbar = ({ previewLink, language, onLanguageChange }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <FixedContainer>
      <Box sx={styles.container}>
        <Button color="primary" variant="contained" onClick={() => navigate(previewLink)}>
          {t('editFeedbackTarget:showPreview')}
        </Button>

        <LanguageSelect
          value={language}
          onChange={onLanguageChange}
          label={t('editFeedbackTarget:translationLanguage')}
        />
      </Box>
    </FixedContainer>
  )
}

export default Toolbar
