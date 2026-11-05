import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import Title from '../../components/common/Title'
import { getLanguageValue } from '../../util/languageUtils'
import { formatDate } from '../FeedbackTarget/tabs/FeedbackView/utils'

const SurveyHeader = ({ survey, children }) => {
  const { t, i18n } = useTranslation()
  const name = getLanguageValue(survey.name, i18n.language)

  return (
    <Box sx={{ mb: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Title>{name}</Title>
      <Typography variant="h4" component="h1">
        {name}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {t('standaloneSurvey:dates', {
          opensAt: formatDate(new Date(survey.opensAt)),
          closesAt: formatDate(new Date(survey.closesAt)),
        })}
      </Typography>
      {children}
    </Box>
  )
}

export default SurveyHeader
