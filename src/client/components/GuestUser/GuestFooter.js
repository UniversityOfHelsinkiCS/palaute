import React from 'react'

import {
  Box,
  Container,
  Divider,
  Link,
  makeStyles,
  Typography,
} from '@mui/material'

import { useTranslation } from 'react-i18next'

import ExternalLink from '../ExternalLink'

import { images } from '../../util/common'

const useStyles = makeStyles((theme) => ({
  logo: {
    marginLeft: theme.spacing(2),
    width: '80px',
    height: 'auto',
  },
}))

const supportEmail = 'coursefeedback@helsinki.fi'
const accessibilityDocument =
  'https://github.com/UniversityOfHelsinkiCS/palaute/blob/master/documentation/accessibility.md'
const dataProtectionNotice =
  'https://wiki.helsinki.fi/display/CF/Data+protection+notice'

const GuestFooter = () => {
  const classes = useStyles()
  const { t } = useTranslation()

  return (
    <Box marginTop="auto">
      <Divider />
      <Container component="footer">
        <Box
          my={2}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <div>
            <Typography>
              {t('footer:contactSupport')}:{' '}
              <Link href={`mailto:${supportEmail}`}>{supportEmail}</Link>
            </Typography>
            <ExternalLink href={accessibilityDocument}>
              {t('footer:accessibilityDocument')}
            </ExternalLink>
            <Typography>
              <ExternalLink href={dataProtectionNotice}>
                {t('feedbackView:dataProtectionNotice')}
              </ExternalLink>
            </Typography>
          </div>

          <Link href="https://toska.dev" target="_blank" rel="noopener">
            <img
              src={images.toska_color}
              className={classes.logo}
              alt="Toska"
            />
          </Link>
        </Box>
      </Container>
    </Box>
  )
}

export default GuestFooter
