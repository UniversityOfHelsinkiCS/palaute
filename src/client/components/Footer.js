import React from 'react'
import { Box, Divider, Container, makeStyles, Link } from '@material-ui/core'
import { useTranslation } from 'react-i18next'

import { images } from '../util/common'

const useStyles = makeStyles((theme) => ({
  logo: {
    marginLeft: theme.spacing(2),
    width: '80px',
    height: 'auto',
  },
}))

const supportEmail = 'grp-toska@helsinki.fi'

const Footer = () => {
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
            {t('footer:contactSupport')}:{' '}
            <Link href={`mailto:${supportEmail}`}>{supportEmail}</Link>
          </div>

          <Link href="https://toska.dev">
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
