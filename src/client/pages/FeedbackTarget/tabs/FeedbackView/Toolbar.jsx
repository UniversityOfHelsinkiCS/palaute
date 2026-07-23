import { Edit } from '@mui/icons-material'
import { Box } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import FixedContainer from '../../../../components/common/FixedContainer'
import LanguageSelect from '../../../../components/common/LanguageSelect'
import { NorButton } from '../../../../components/common/NorButton'

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
          <NorButton color="secondary" component={Link} to={editLink} icon={<Edit />}>
            {t('feedbackView:editSurvey')}
          </NorButton>
        ) : (
          <div />
        )}

        <LanguageSelect value={language} onChange={onLanguageChange} label={t('feedbackView:translationLanguage')} />
      </Box>
    </FixedContainer>
  )
}

export default Toolbar
