import React from 'react'

import { Box, Typography } from '@mui/material'

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
  <Box m="0.5rem" ml="1.5rem">
    <Typography variant="h6" sx={styles.label} {...labelProps}>
      {label}
      {required && ' *'}
    </Typography>
    {description && (
      <Typography sx={styles.description}>{description}</Typography>
    )}
    {children}
  </Box>
)

export default QuestionBase
