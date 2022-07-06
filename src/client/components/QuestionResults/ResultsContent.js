import React from 'react'
import { Typography } from '@mui/material'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles((theme) => ({
  title: {
    marginBottom: theme.spacing(2),
  },
  description: {
    marginBottom: theme.spacing(2),
  },
  chart: {
    margin: '0px auto',
  },
}))

const ResultsContent = ({ chart, title, children, description }) => {
  const classes = useStyles()

  return (
    <>
      <Typography variant="h6" component="h2" className={classes.title}>
        {title}
      </Typography>
      {description && (
        <Typography className={classes.description}>{description}</Typography>
      )}
      {chart && <div className={classes.chart}>{chart}</div>}
      {children}
    </>
  )
}

export default ResultsContent
