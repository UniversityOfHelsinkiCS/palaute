import { VisibilityOffOutlined } from '@mui/icons-material'
import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'

const NotPublicTag = () => {
  const { t } = useTranslation()

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        columnGap: 0.5,
        typography: 'caption',
        color: 'text.secondary',
      }}
    >
      <VisibilityOffOutlined aria-hidden="true" sx={{ fontSize: '0.875rem' }} />
      {t('common:notPublic')}
    </Box>
  )
}

export default NotPublicTag
