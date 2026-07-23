import type { LinkProps, Theme } from '@mui/material'

import ExternalLinkIcon from '@mui/icons-material/OpenInNew'
import { Link, Box } from '@mui/material'
import { visuallyHidden } from '@mui/utils'
import { useTranslation } from 'react-i18next'

const styles = {
  icon: {
    marginLeft: (theme: Theme) => theme.spacing(0.5),
    fontSize: '1em',
  },
}

const ExternalLink = ({ children, ...props }: LinkProps) => {
  const { t } = useTranslation()

  return (
    <Link target="_blank" rel="noopener noreferrer" {...props} underline="always">
      {children}
      <ExternalLinkIcon sx={styles.icon} aria-hidden="true" />
      <Box component="span" sx={{ ...visuallyHidden, width: '0px', height: '0px' }}>
        {t('common:opensInNewTab')}
      </Box>
    </Link>
  )
}

export default ExternalLink
