import React from 'react'

import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'

import Markdown from '../common/Markdown'

const styles = {
  label: {
    marginBottom: theme => theme.spacing(1),
  },
  description: {
    marginBottom: theme => theme.spacing(1),
  },
}

const MarkdownPreviewBase = ({ label, description, children, required = false }) => {
  const { t } = useTranslation()

  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <Markdown sx={styles.label}>{label || t('questionEditor:label')}</Markdown>
        {required && ' *'}
      </Box>
      {description && <Markdown sx={styles.description}>{description}</Markdown>}
      {children}
    </>
  )
}

export default MarkdownPreviewBase
