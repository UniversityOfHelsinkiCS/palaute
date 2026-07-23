import { Visibility } from '@mui/icons-material'
import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import FixedContainer from '../../../../../components/common/FixedContainer'
import LanguageSelect from '../../../../../components/common/LanguageSelect'
import { NorButton } from '../../../../../components/common/NorButton'

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
        <NorButton color="secondary" icon={<Visibility />} onClick={() => navigate(previewLink)}>
          {t('editFeedbackTarget:showPreview')}
        </NorButton>

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
