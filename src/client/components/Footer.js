import React from 'react'

import { Box, Container, Divider, Link, Typography } from '@mui/material'

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
          {!inProduction && (
            <>
              <Box>
                <Typography>{inStaging ? 'STAGING' : 'DEVELOPMENT'}</Typography>
              </Box>
              <img src={images.norppa_viskaali} style={styles.norppa} alt="Norppa drawing by tttriple" />
            </>
          )}
          <div>
            <Typography>
              {t('footer:contactSupport')}:{' '}
              <Link href={`mailto:${t('links:supportEmail')}`} underline="hover">
                {t('links:supportEmail')}
              </Link>
            </Typography>
            <ExternalLink href={t('links:accessibility')}>{t('footer:accessibilityDocument')}</ExternalLink>
            <Typography>
              <ExternalLink href={t('links:dataProtection')}>{t('feedbackView:dataProtectionNotice')}</ExternalLink>
            </Typography>
            {user && user.isTeacher && (
              <Typography>
                <ExternalLink href={t('links:wikiRoot')}>{t('footer:wikiLink')}</ExternalLink>
              </Typography>
            )}
          </div>
          <Box display="flex" flexDirection="column" alignItems="center" rowGap="1rem">
            <Link href={t('links:toska')} target="_blank" rel="noopener" underline="hover">
              <img src={images.toska_color} style={styles.logo} alt="Toska" />
            </Link>
            {duration && (
              <>
                <Typography variant="subtitle1" fontSize={10}>
                  {t('footer:lastUpdate', { duration })}
                </Typography>
                {user.isAdmin && (
                  <Typography variant="subtitle1" fontSize={10}>
                    git sha = {GIT_SHA}
                  </Typography>
                )}
              </>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default Footer
