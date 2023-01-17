import React from 'react'
import { Link } from 'react-router-dom'
import { Button, Link as MuiLink } from '@mui/material'
import { OpenInNew } from '@mui/icons-material'

const styles = {
  button: {
    py: '0.8rem',
    boxShadow: '0 3px 10px 1px rgb(60 130 245 / 20%)',
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
