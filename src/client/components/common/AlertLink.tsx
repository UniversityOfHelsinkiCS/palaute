import type { LinkProps, Theme } from '@mui/material'

import { Link, Box } from '@mui/material'
import { visuallyHidden } from '@mui/utils'
import { useTranslation } from 'react-i18next'

import { mergeSx } from '../../util/sx'

const styles = {
  alertLink: {
    fontWeight: (theme: Theme) => theme.typography.fontWeightMedium,
    marginRight: '2px',
  },
}

const AlertLink = ({ sx, rel, target, children, ...props }: LinkProps) => {
  const { t } = useTranslation()
  const finalRel = target === '_blank' ? [rel, 'noopener noreferrer'].filter(Boolean).join(' ') : rel

  return (
    <Link
      color="inherit"
      sx={mergeSx(styles.alertLink, sx)}
      target={target}
      rel={finalRel}
      {...props}
      underline="hover"
    >
      {children}
      {target === '_blank' && (
        <Box component="span" sx={{ ...visuallyHidden, width: '0px', height: '0px' }}>
          {t('common:opensInNewTab')}
        </Box>
      )}
    </Link>
  )
}

export default AlertLink
