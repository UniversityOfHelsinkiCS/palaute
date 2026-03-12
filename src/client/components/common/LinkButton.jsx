import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button, Link as MuiLink, Box } from '@mui/material'
import { OpenInNew } from '@mui/icons-material'
import { visuallyHidden } from '@mui/utils'
import { focusIndicatorStyle } from '../../util/accessibility'

const LinkButton = ({ title, to, external = false, sx = {}, ...rest }) => {
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
      sx={{ ...sx, textDecoration: 'underline', '&:hover': { textDecoration: 'underline' }, ...focusIndicatorStyle() }}
      disableRipple
    >
      {title}
      {external && (
        <Box component="span" sx={{ ...visuallyHidden, width: '0px', height: '0px' }}>
          {t('common:opensInNewTab')}
        </Box>
      )}
    </Button>
  )
}

export default LinkButton
