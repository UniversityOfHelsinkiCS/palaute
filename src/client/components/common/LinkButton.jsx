import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button, Link as MuiLink } from '@mui/material'
import { OpenInNew } from '@mui/icons-material'
import { visuallyHidden } from '@mui/utils'

const LinkButton = ({ title, to, external = false, ...rest }) => {
  const { t } = useTranslation()
  const buttonProps = {
    ...(external
      ? {
          component: MuiLink,
          href: to,
          rel: 'noopener noreferrer',
          target: '_blank',
          endIcon: <OpenInNew aria-hidden="true" />,
        }
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
      {external && <span style={visuallyHidden}>{t('common:opensInNewTab')}</span>}
    </Button>
  )
}

export default LinkButton
