import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'

import FixedContainer from '../../../../../components/common/FixedContainer'
import LanguageSelect from '../../../../../components/common/LanguageSelect'

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
}

const Toolbar = ({ language, onLanguageChange }) => {
  const { t } = useTranslation()

  return (
    <FixedContainer>
      <Box sx={styles.container}>
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
