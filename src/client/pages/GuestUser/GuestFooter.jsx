import React from 'react'
/** @jsxImportSource @emotion/react */

import { Box, Container, Divider, Link, Typography } from '@mui/material'

import { useTranslation } from 'react-i18next'

import ExternalLink from '../../components/common/ExternalLink'

import { images } from '../../util/common'

const styles = {
  logo: {
    marginLeft: theme => theme.spacing(2),
    width: '80px',
    height: 'auto',
  },
}

const GuestFooter = () => {
  const { t } = useTranslation()

  return (
    <Box component="footer" role="contentinfo" marginTop="auto">
      <Divider />
      <Container>
        <Box my={2} display="flex" justifyContent="space-between" alignItems="center">
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
          </div>

          <Link href={t('links:toska')} target="_blank" rel="noopener" underline="hover">
            <img src={images.toska_color} style={styles.logo} alt={t('footer:toska')} />
          </Link>
        </Box>
      </Container>
    </Box>
  )
}

export default GuestFooter
