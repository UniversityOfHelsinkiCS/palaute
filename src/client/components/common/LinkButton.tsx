import type { ButtonProps, SxProps, Theme } from '@mui/material'

import { OpenInNew } from '@mui/icons-material'
import { Button, Link as MuiLink, Box } from '@mui/material'
import { visuallyHidden } from '@mui/utils'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { focusIndicatorStyle } from '../../util/accessibility'
import { mergeSx } from '../../util/sx'

type LinkButtonProps = Omit<ButtonProps<'a'>, 'component' | 'href' | 'title' | 'ref'> & {
  title: React.ReactNode
  to: string
  external?: boolean
  sx?: SxProps<Theme>
}

const LinkButton = ({ title, to, external = false, sx = {}, ...rest }: LinkButtonProps) => {
  const { t } = useTranslation()
  const buttonSx = mergeSx(
    sx,
    {
      textDecoration: 'underline',
      '&:hover': { textDecoration: 'underline' },
    },
    focusIndicatorStyle()
  )

  if (external) {
    return (
      <Button
        {...rest}
        size="small"
        component={MuiLink}
        href={to}
        rel="noopener noreferrer"
        target="_blank"
        endIcon={<OpenInNew aria-hidden="true" />}
        sx={buttonSx}
        disableRipple
      >
        {title}
        <Box component="span" sx={{ ...visuallyHidden, width: '0px', height: '0px' }}>
          {t('common:opensInNewTab')}
        </Box>
      </Button>
    )
  }

  return (
    <Button {...rest} size="small" component={Link} to={to} sx={buttonSx} disableRipple>
      {title}
    </Button>
  )
}

export default LinkButton
