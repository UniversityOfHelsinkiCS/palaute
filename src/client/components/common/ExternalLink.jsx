import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from '@mui/material'
import ExternalLinkIcon from '@mui/icons-material/OpenInNew'
import { visuallyHidden } from '@mui/utils'

const styles = {
  icon: {
    marginLeft: theme => theme.spacing(0.5),
    fontSize: '1em',
  },
}

const ExternalLink = ({ children, ...props }) => {
  const { t } = useTranslation()

  return (
    <Link target="_blank" rel="noopener" {...props} underline="always">
      {children}
      <ExternalLinkIcon sx={styles.icon} aria-hidden="true" />
      <span style={visuallyHidden}>{t('common:opensInNewTab')}</span>
    </Link>
  )
}

export default ExternalLink
