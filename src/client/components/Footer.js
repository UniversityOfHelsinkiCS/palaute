import React from 'react'

import {
  Box,
  Container,
  Divider,
  Link,
  makeStyles,
  Typography,
} from '@material-ui/core'

import { useTranslation } from 'react-i18next'

import ExternalLink from './ExternalLink'

import { images } from '../util/common'

import { inProduction } from '../../config'

const useStyles = makeStyles((theme) => ({
  logo: {
    marginLeft: theme.spacing(2),
    width: '80px',
    height: 'auto',
  },
}))

const supportEmail = 'coursefeedback@helsinki.fi'
const wikiLink = 'https://wiki.helsinki.fi/display/CF'
const accessibilityDocument =
  'https://github.com/UniversityOfHelsinkiCS/palaute/blob/master/documentation/accessibility.md'
const dataProtectionNotice =
  'https://wiki.helsinki.fi/pages/viewpage.action?pageId=393554991'

const Footer = ({ user }) => {
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
          {!inProduction && (
            <Box>
              <Typography>DEVELOPMENT</Typography>
            </Box>
          )}
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
            {user && user.isTeacher && (
              <Typography>
                <ExternalLink href={wikiLink}>
                  {t('footer:wikiLink')}
                </ExternalLink>
              </Typography>
            )}
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

export default Footer
