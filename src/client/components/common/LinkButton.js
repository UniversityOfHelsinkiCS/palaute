import React from 'react'
import { Link } from 'react-router-dom'
import { Button, Link as MuiLink } from '@mui/material'
import { OpenInNew } from '@mui/icons-material'

const styles = {
  button: {
    p: '1rem',
    boxShadow: '0 4px 12px 1px rgb(50 120 255 / 21%)',
  },
}

const LinkButton = ({ title, to, external = false }) => {
  const buttonProps = {
    sx: styles.button,
    ...(external ? { component: MuiLink, href: to, endIcon: <OpenInNew /> } : { component: Link, to }),
  }

  return <Button {...buttonProps}>{title}</Button>
}

export default LinkButton
