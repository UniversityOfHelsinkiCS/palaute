import React from 'react'

import { Typography } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { useTranslation } from 'react-i18next'

const useStyles = makeStyles((theme) => ({
  label: {
    marginBottom: theme.spacing(1),
  },
  description: {
    marginBottom: theme.spacing(1),
  },
}))

const PreviewBase = ({ label, description, children, required = false }) => {
  const classes = useStyles()

  const { t } = useTranslation()

  return (
    <>
      <Typography variant="h6" component="h2" className={classes.label}>
        {label || t('questionEditor:label')}
        {required && ' *'}
      </Typography>
      {description && (
        <Typography className={classes.description}>{description}</Typography>
      )}
      {children}
    </>
  )
}

export default PreviewBase
