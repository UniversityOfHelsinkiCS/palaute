import React from 'react'
import { makeStyles, Paper, Container } from '@material-ui/core'
import { useInView } from 'react-intersection-observer'

const useStyles = makeStyles((theme) => ({
  floatingWrapper: {
    position: 'fixed',
    bottom: '0px',
    width: '100%',
    left: '0px',
    padding: theme.spacing(2, 0),
    zIndex: 999,
  },
}))

const FixedContainer = ({ children, intersectionObserverOptions = {} }) => {
  const classes = useStyles()

  const { ref, inView } = useInView({
    threshold: 0,
    ...intersectionObserverOptions,
  })

  return (
    <>
      {!inView && (
        <Paper className={classes.floatingWrapper} elevation={3} square>
          <Container>{children}</Container>
        </Paper>
      )}
      <div ref={ref}>{children}</div>
    </>
  )
}

export default FixedContainer
