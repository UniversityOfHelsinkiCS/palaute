import React from 'react'
import { Box, Card } from '@mui/material'

/**
 * Cool but stupid card that glows when hovered. Waste of electricity.
 */
const GlowingCard = ({ children, sx }) => {
  const hoverRef = React.useRef(null)
  const elementRef = React.useRef(null)

  React.useEffect(() => {
    const onMove = e => {
      const { clientX, clientY } = e
      elementRef.current.style.opacity = 1
      const { top, left } = hoverRef.current.getBoundingClientRect()
      const x = clientX - left
      const y = clientY - top
      elementRef.current.style.left = `${x}px`
      elementRef.current.style.top = `${y}px`
    }

    const onExit = () => {
      elementRef.current.style.opacity = 0
    }

    const hoverElement = hoverRef.current
    hoverElement.addEventListener('mousemove', onMove)
    hoverElement.addEventListener('mouseleave', onExit)
    return () => {
      hoverElement.removeEventListener('mousemove', onMove)
      hoverElement.removeEventListener('mouseleave', onExit)
    }
  }, [])

  return (
    <Card
      ref={hoverRef}
      sx={{
        position: 'relative',
        ...sx,
      }}
    >
      <Box
        position="absolute"
        width="1px"
        height="1px"
        ref={elementRef}
        bgcolor="transparent"
        sx={{
          opacity: 0,
          zIndex: 0,
          boxShadow: '0px 0px 220px 60px rgba(0,136,199,0.55)',
          transition: 'opacity 0.3s ease-in-out',
        }}
      />
      {children}
    </Card>
  )
}

export default GlowingCard
