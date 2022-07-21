import React from 'react'
import { Box, Typography } from '@mui/material'

const styles = {
  title: {
    marginBottom: (theme) => theme.spacing(2),
  },
  description: {
    marginBottom: (theme) => theme.spacing(2),
  },
  chart: {
    margin: '0px auto',
  },
}

const ResultsContent = ({ chart, title, children, description }) => (
  <>
    <Typography variant="h6" component="h2" sx={styles.title}>
      {title}
    </Typography>
    {description && (
      <Typography sx={styles.description}>{description}</Typography>
    )}
    {chart && <Box sx={styles.chart}>{chart}</Box>}
    {children}
  </>
)

export default ResultsContent
