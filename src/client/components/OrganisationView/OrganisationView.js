import React from 'react'
import { useTranslation } from 'react-i18next'

import {
  Box,
  CircularProgress,
  makeStyles,
  Typography,
} from '@material-ui/core'

import useOrganisations from '../../hooks/useOrganisations'
import OrganisationList from './OrganisationList'

const useStyles = makeStyles((theme) => ({
  progressContainer: {
    padding: theme.spacing(4, 0),
    display: 'flex',
    justifyContent: 'center',
  },
}))

const OrganisationView = () => {
  const classes = useStyles()
  const { organisations, isLoading } = useOrganisations()

  const { t } = useTranslation()

  if (isLoading) {
    return (
      <Box my={4} className={classes.progressContainer}>
        <CircularProgress />
      </Box>
    )
  }

  if (!isLoading && organisations.length === 0) {
    return (
      <Box my={4}>
        <Typography>{t('organisationView:noOrganisations')}</Typography>
      </Box>
    )
  }

  return (
    <>
      <Typography variant="h6" component="h4">
        {t('organisationView:organisations')}
      </Typography>
      {organisations.length > 0 && (
        <OrganisationList organisations={organisations} />
      )}
    </>
  )
}

export default OrganisationView
