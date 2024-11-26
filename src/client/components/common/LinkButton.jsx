import React from 'react'
import { Link } from 'react-router-dom'
import { Button, Link as MuiLink } from '@mui/material'
import { OpenInNew } from '@mui/icons-material'

const LinkButton = ({ title, to, external = false, ...rest }) => {
  const buttonProps = {
    ...(external
      ? { component: MuiLink, href: to, rel: 'noopener noreferrer', target: '_blank', endIcon: <OpenInNew /> }
      : { component: Link, to }),
  }

  return (
    <Button
      {...rest}
      size="small"
      {...buttonProps}
      sx={{ textDecoration: 'underline', '&:hover': { textDecoration: 'underline' } }}
    >
      {title}
    </Button>
  )
}

export default LinkButton
