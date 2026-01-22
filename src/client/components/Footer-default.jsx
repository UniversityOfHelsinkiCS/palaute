import React from 'react'

import { Box, Container, Divider, Link, Typography } from '@mui/material'

import { useTranslation } from 'react-i18next'
import { formatDistanceToNow } from 'date-fns/esm'

import ExternalLink from './common/ExternalLink'

import { images, inProduction, inStaging } from '../util/common'

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

  const uptime = formatDistanceToNow(user?.lastRestart ? Date.parse(user?.lastRestart) : Date.now(), {
    locale: localeForLanguage(i18n.language),
  })
  const serverVersion = user?.serverVersion
  const clientVersion = import.meta.env.VITE_VERSION

  return (
    <Box component="footer" marginTop="auto" pt="1rem">
      <Divider />
      <Container maxWidth="xl">
        <Box my="2rem" display="flex" justifyContent="space-between" alignItems="center">
          {!inProduction && (
            <>
              <Box>
                <Typography>{inStaging ? 'STAGING' : 'DEVELOPMENT'}</Typography>
              </Box>
              <img
                src={images.norppa_viskaali}
                loading="lazy"
                height={100}
                style={styles.norppa}
                alt="Happy looking seal named Norppa lying on a surface with a hat on its head and a stick in its mouth"
              />
            </>
          )}
          <div>
            <Typography>
              {t('footer:contactSupport')}:{' '}
              <Link href={`mailto:${t('links:supportEmail')}`} underline="always">
                {t('links:supportEmail')}
              </Link>
            </Typography>
            <ExternalLink href={t('links:accessibility')}>{t('footer:accessibilityDocument')}</ExternalLink>
            <Typography>
              <ExternalLink href={t('links:dataProtection')}>{t('feedbackView:dataProtectionNotice')}</ExternalLink>
            </Typography>
            {user && user.isEmployee && (
              <Typography>
                <ExternalLink href={t('links:wikiRoot')}>{t('footer:wikiLink')}</ExternalLink>
              </Typography>
            )}
          </div>
          <Box display="flex" flexDirection="column" alignItems="center" rowGap="1rem">
            <Link href={t('links:toska')} target="_blank" rel="noopener" underline="always">
              <img src={images.toska_color} loading="lazy" style={styles.logo} alt="Toska" />
            </Link>
            <Typography component="p" variant="subtitle1" fontSize={10}>
              {t('footer:lastUpdate', { duration: uptime })}
            </Typography>
            <Typography variant="caption">{t('footer:server', { version: serverVersion })}</Typography>
            <Typography variant="caption">{t('footer:client', { version: clientVersion })}</Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default Footer
