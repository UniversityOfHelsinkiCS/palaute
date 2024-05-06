import React from 'react'
import { Link } from '@mui/material'

const styles = {
  alertLink: {
    fontWeight: theme => theme.typography.fontWeightMedium,
    textDecoration: 'underline',
  },
}

const AlertLink = ({ sx, ...props }) => (
  <Link color="inherit" sx={[sx, styles.alertLink]} {...props} underline="hover" />
)

export default AlertLink
