import type { Theme } from '@mui/material'
import type { ReactNode } from 'react'
import type { IntersectionOptions } from 'react-intersection-observer'

import { Container, Paper } from '@mui/material'
import { useInView } from 'react-intersection-observer'

const styles = {
  floatingWrapper: {
    position: 'fixed',
    width: '100%',
    left: '0px',
    padding: (theme: Theme) => theme.spacing(2, 0),
    zIndex: 999,
  },
}

type FixedContainerProps = {
  children: ReactNode
  intersectionObserverOptions?: IntersectionOptions
}

const FixedContainer = ({ children, intersectionObserverOptions = {} }: FixedContainerProps) => {
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
