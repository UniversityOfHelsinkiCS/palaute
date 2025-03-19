import React from 'react'

import { Box, Container, Divider, Grid, Link, Typography } from '@mui/material'

import { useTranslation } from 'react-i18next'

import ExternalLink from './common/ExternalLink'

import { inProduction, inStaging } from '../util/common'

const Footer = ({ user }) => {
  const { t } = useTranslation()
  return (
    <Box marginTop="auto" pt="1rem">
      <Divider />
      <Container component="footer" maxWidth="xl">
        {!inProduction && (
          <Box my={2}>
            <Box>
              <Typography>{inStaging ? 'STAGING' : 'DEVELOPMENT'}</Typography>
            </Box>
          </Box>
        )}
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
                <Grid item xs={12} md="auto">
                  <ExternalLink href={t('links:accessibility')}>{t('footer:accessibilityDocument')}</ExternalLink>
                </Grid>
                <Grid item xs={12} md="auto">
                  <Typography>
                    <ExternalLink href={t('links:dataProtection')}>
                      {t('feedbackView:dataProtectionNotice')}
                    </ExternalLink>
                  </Typography>
                </Grid>
                {user && user.isEmployee && (
                  <Grid item xs={12} md="auto">
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
