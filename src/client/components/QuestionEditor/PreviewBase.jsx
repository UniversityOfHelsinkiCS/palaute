import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import Markdown from '../common/Markdown'

const PreviewBase = ({ label, description, children, required = false }) => {
  const { t } = useTranslation()

  return (
    <Box>
      <Typography component="h2" variant="h6" sx={{ mb: 1 }}>
        {`${label || t('questionEditor:label')}${required ? ' *' : ''}`}
      </Typography>
      {description && (
        <Box sx={{ mb: 3 }}>
          <Markdown>{description}</Markdown>
        </Box>
      )}
      {children}
    </Box>
  )
}

export default PreviewBase
