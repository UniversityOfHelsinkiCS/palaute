import React from 'react'

import { Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

const styles = {
  label: {
    marginBottom: theme => theme.spacing(1),
  },
  description: {
    marginBottom: theme => theme.spacing(1),
  },
}

const PreviewBase = ({ label, description, children, required = false }) => {
  const { t } = useTranslation()

  return (
    <>
      <Typography variant="h6" component="h2" sx={styles.label}>
        {label || t('questionEditor:label')}
        {required && ' *'}
      </Typography>
      {description && <Typography sx={styles.description}>{description}</Typography>}
      {children}
    </>
  )
}

export default PreviewBase
