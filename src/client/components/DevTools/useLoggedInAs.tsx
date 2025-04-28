import { useEffect, useState } from 'react'

export const useLoggedInAs = () => {
  const [isLoggedInAs, setIsLoggedInAs] = useState(false)

  useEffect(() => {
    const loggedInAs = localStorage.getItem('adminLoggedInAs')
    if (!loggedInAs) return

    setIsLoggedInAs(true)
  }, [])

  const exitLoggedInAs = () => {
    setIsLoggedInAs(false)
    localStorage.removeItem('adminLoggedInAs')
    window.location.reload()
  }

  return {
    isLoggedInAs,
    exitLoggedInAs,
  }
}
