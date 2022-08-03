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
  questionContainer: (theme) => ({
    margin: '0.5rem',
    marginLeft: '1rem',
    [theme.breakpoints.down('md')]: {
      margin: 0,
      marginLeft: 0,
    },
  }),
}

const QuestionBase = ({
  children,
  label,
  description,
  required,
  labelProps = {},
}) => (
  <Box sx={styles.questionContainer}>
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
