import React from 'react'
/** @jsxImportSource @emotion/react */

import { Box, Container, Divider, Link, Typography } from '@mui/material'

import { useTranslation } from 'react-i18next'
import { formatDuration, intervalToDuration } from 'date-fns'

import ExternalLink from './common/ExternalLink'

import { images } from '../util/common'

import { inProduction } from '../../config'
import { localeForLanguage } from '../util/languageUtils'

const styles = {
  logo: {
    marginLeft: theme => theme.spacing(2),
    width: '80px',
    height: 'auto',
  },
  norppa: {
    height: '100px',
  },
}

const supportEmail = 'coursefeedback@helsinki.fi'
const wikiLink = 'https://wiki.helsinki.fi/display/CF'
const accessibilityDocument =
  'https://github.com/UniversityOfHelsinkiCS/palaute/blob/master/documentation/accessibility.md'
const dataProtectionNotice = 'https://wiki.helsinki.fi/pages/viewpage.action?pageId=393554991'

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
    <Box marginTop="auto">
      <Divider />
      <Container component="footer" maxWidth="xl">
        <Box mb={1} mt={2} display="flex" justifyContent="space-between" alignItems="center">
          {!inProduction && (
            <>
              <Box>
                <Typography>DEVELOPMENT</Typography>
              </Box>
              <img src={images.norppa_viskaali} css={styles.norppa} alt="Norppa drawing by tttriple" />
            </>
          )}
          <div>
            <Typography>
              {t('footer:contactSupport')}:{' '}
              <Link href={`mailto:${supportEmail}`} underline="hover">
                {supportEmail}
              </Link>
            </Typography>
            <ExternalLink href={accessibilityDocument}>{t('footer:accessibilityDocument')}</ExternalLink>
            <Typography>
              <ExternalLink href={dataProtectionNotice}>{t('feedbackView:dataProtectionNotice')}</ExternalLink>
            </Typography>
            {user && user.isTeacher && (
              <Typography>
                <ExternalLink href={wikiLink}>{t('footer:wikiLink')}</ExternalLink>
              </Typography>
            )}
          </div>
          <Box display="flex" flexDirection="column" alignItems="center" rowGap="1rem">
            <Link href="https://toska.dev" target="_blank" rel="noopener" underline="hover">
              <img src={images.toska_color} css={styles.logo} alt="Toska" />
            </Link>
            {duration && (
              <Typography variant="subtitle1" fontSize={14}>
                {t('footer:lastUpdate', { duration })}
              </Typography>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default Footer
