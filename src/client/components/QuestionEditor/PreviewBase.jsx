import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import Markdown from '../common/Markdown'

const PreviewBase = ({ id, label, description, children, required = false, labelProps = {} }) => {
  const { t } = useTranslation()
  const descriptionId = description ? `${id}-description` : undefined

  return (
    <Box id={id}>
      <Typography variant="h6" sx={{ mb: 1 }} {...labelProps}>
        {`${label || t('questionEditor:label')}${required ? ' *' : ''}`}
      </Typography>
      {description && (
        <Box id={descriptionId} sx={{ mb: 3 }}>
          <Markdown>{description}</Markdown>
        </Box>
      )}
      {children}
    </Box>
  )
}

export default PreviewBase
