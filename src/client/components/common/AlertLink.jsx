import React from 'react'
import { Link } from '@mui/material'

const styles = {
  alertLink: {
    fontWeight: theme => theme.typography.fontWeightMedium,
    textDecoration: 'underline',
    marginRight: '2px',
  },
}

const AlertLink = ({ sx, rel, target, ...props }) => {
  const finalRel = target === '_blank' ? [rel, 'noopener noreferrer'].filter(Boolean).join(' ') : rel

  return (
    <Link color="inherit" sx={[sx, styles.alertLink]} target={target} rel={finalRel} {...props} underline="hover" />
  )
}

export default AlertLink
