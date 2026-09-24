import { InfoOutlined } from '@mui/icons-material'
import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'

import sealImage from './assets/seal.png'

type EmptyStateProps = {
  hasGuide: boolean
}

const EmptyState = ({ hasGuide }: EmptyStateProps) => {
  const { t } = useTranslation()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        p: '28px 12px 0',
        textAlign: 'center',
        '& p': { m: 0, maxWidth: 290, color: 'text.secondary' },
      }}
    >
      <Box component="img" src={sealImage} alt="" sx={{ width: 72, height: 72, mb: '6px' }} />
      <Box component="h3" sx={{ m: 0, fontSize: '17px', fontWeight: 700 }}>
        {t('helpChatbot:greetingTitle')}
      </Box>
      <p>{t('helpChatbot:greetingBody')}</p>
      <Box
        component="p"
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '6px',
          mt: '10px !important',
          fontSize: '12.5px',
          textAlign: 'left',
        }}
      >
        <InfoOutlined aria-hidden="true" sx={{ flex: 'none', fontSize: 15, mt: '2px' }} />
        <span>
          {t('helpChatbot:disclaimer')}
          {hasGuide && ` ${t('helpChatbot:disclaimerGuide')}`}
        </span>
      </Box>
    </Box>
  )
}

export default EmptyState
