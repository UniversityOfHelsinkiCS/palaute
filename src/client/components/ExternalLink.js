import React from 'react'
import { Link } from '@mui/material'
import ExternalLinkIcon from '@mui/icons-material/OpenInNew'

const styles = {
  icon: {
    marginLeft: (theme) => theme.spacing(0.5),
    fontSize: '1em',
  },
}

const ExternalLink = ({ children, ...props }) => (
  <Link target="_blank" rel="noopener" {...props} underline="hover">
    {children}
    <ExternalLinkIcon sx={styles.icon} />
  </Link>
)

export default ExternalLink
