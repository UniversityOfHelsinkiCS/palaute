import { Container, Paper } from '@mui/material'
import React from 'react'
import { useInView } from 'react-intersection-observer'

const styles = {
  floatingWrapper: {
    position: 'fixed',
    width: '100%',
    left: '0px',
    padding: (theme) => theme.spacing(2, 0),
    zIndex: 999,
  },
}

const FixedContainer = ({ children, intersectionObserverOptions = {} }) => {
  const { ref, inView } = useInView({
    threshold: 0,
    ...intersectionObserverOptions,
  })

  return (
    <>
      {!inView && (
        <Paper sx={styles.floatingWrapper} elevation={3} square>
          <Container>{children}</Container>
        </Paper>
      )}
      <div ref={ref}>{children}</div>
    </>
  )
}

export default FixedContainer
