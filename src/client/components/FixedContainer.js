import { Container, makeStyles, Paper } from '@material-ui/core'
import React from 'react'
import { useInView } from 'react-intersection-observer'

const useStyles = makeStyles((theme) => ({
  floatingWrapper: {
    position: 'fixed',
    bottom: (props) => (props.placement === 'bottom' ? '0px' : 'auto'),
    top: (props) => (props.placement === 'top' ? '0px' : 'auto'),
    width: '100%',
    left: '0px',
    padding: theme.spacing(2, 0),
    zIndex: 999,
  },
}))

const FixedContainer = ({
  children,
  placement = 'bottom',
  intersectionObserverOptions = {},
}) => {
  const classes = useStyles({ placement })

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
