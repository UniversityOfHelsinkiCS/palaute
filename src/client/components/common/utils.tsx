import React from 'react'

export const handleTabKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
  if (e.key === ' ') {
    e.preventDefault()
    e.currentTarget.click()
  }
}
