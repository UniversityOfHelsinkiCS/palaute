import React from 'react'

import { Box, Container, Divider, Grid, Link, Typography } from '@mui/material'

import { useTranslation } from 'react-i18next'
import { formatDuration, intervalToDuration } from 'date-fns'

import ExternalLink from './common/ExternalLink'

import { GIT_SHA, images, inProduction, inStaging } from '../util/common'

import { localeForLanguage } from '../util/languageUtils'

const styles = {
  logo: {
    marginLeft: '2rem',
    width: '80px',
    height: 'auto',
  },
  norppa: {
    height: '100px',
  },
}

const Footer = ({ user }) => {
  const { t, i18n } = useTranslation()
  const duration = Date.parse(user?.lastRestart)
    ? formatDuration(
        intervalToDuration({
          start: Date.parse(user?.lastRestart),
          end: Date.now(),
        }),
        { locale: localeForLanguage(i18n.language) }
      )
    : ''

  return (
    <Box marginTop="auto" pt="1rem">
      <Divider />
      <Container component="footer" maxWidth="xl">
        <Box my="2rem" display="flex" justifyContent="space-between" alignItems="center">
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography>
                {t('footer:contactSupport')}:{' '}
                <Link href={`mailto:${t('links:supportEmail')}`} underline="hover">
                  {t('links:supportEmail')}
                </Link>
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Grid container spacing={2} justifyContent="flex-end">
                <Grid item xs={12} md={'auto'}>
                  <ExternalLink href={t('links:accessibility')}>{t('footer:accessibilityDocument')}</ExternalLink>
                </Grid>
                <Grid item xs={12} md={'auto'}>
                  <Typography>
                    <ExternalLink href={t('links:dataProtection')}>
                      {t('feedbackView:dataProtectionNotice')}
                    </ExternalLink>
                  </Typography>
                </Grid>
                {user && user.isTeacher && (
                  <Grid item xs={12} md={'auto'}>
                    <Typography>
                      <ExternalLink href={t('links:wikiRoot')}>{t('footer:wikiLink')}</ExternalLink>
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  )
}

export default Footer
