import {
  Box,
  Container,
  Divider,
  Link,
  makeStyles,
  Typography,
} from '@material-ui/core'
import React from 'react'
import { useTranslation } from 'react-i18next'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'

import { images } from '../util/common'

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
  'https://wiki.helsinki.fi/display/CF/Data+protection+notice'

const Footer = ({ user }) => {
  const classes = useStyles()
  const { t } = useTranslation()

  return (
    <>
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
            <Link href={accessibilityDocument} target="_blank" rel="noopener">
              {t('footer:accessibilityDocument')} <OpenInNewIcon />
            </Link>
            <Typography>
              <Link href={dataProtectionNotice} target="_blank" rel="noopener">
                {t('feedbackView:dataProtectionNotice')} <OpenInNewIcon />
              </Link>
            </Typography>
            {user && user.isTeacher && (
              <Typography>
                <Link href={wikiLink} target="_blank" rel="noopener">
                  {t('footer:wikiLink')} <OpenInNewIcon />
                </Link>
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
    </>
  )
}

export default Footer
