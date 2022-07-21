import React from 'react'

import { Typography } from '@mui/material'

const styles = {
  label: {
    marginBottom: (theme) => theme.spacing(1),
    display: 'block',
  },
  description: {
    marginBottom: (theme) => theme.spacing(1),
  },
}

const QuestionBase = ({
  children,
  label,
  description,
  required,
  labelProps = {},
}) => (
  <>
    <Typography variant="h6" sx={styles.label} {...labelProps}>
      {label}
      {required && ' *'}
    </Typography>
    {description && (
      <Typography sx={styles.description}>{description}</Typography>
    )}
    {children}
  </>
)

export default QuestionBase
