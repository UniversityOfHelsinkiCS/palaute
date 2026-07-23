import { useEffect } from 'react'

const Title = ({ children }: { children: string }) => {
  useEffect(() => {
    document.title = children
  }, [children])

  return null
}

export default Title
