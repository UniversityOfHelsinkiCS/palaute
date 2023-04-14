import React from 'react'
import { Link } from 'react-router-dom'
import { Button, Link as MuiLink } from '@mui/material'
import { OpenInNew } from '@mui/icons-material'

const LinkButton = ({ title, to, external = false }) => {
  const buttonProps = {
    ...(external ? { component: MuiLink, href: to, endIcon: <OpenInNew /> } : { component: Link, to }),
  }

  return (
    <Button size="small" {...buttonProps}>
      {title}
    </Button>
  )
}

export default LinkButton
