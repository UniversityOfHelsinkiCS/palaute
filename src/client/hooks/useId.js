import { useMemo } from 'react'

const generateId = () => {
  const date = Date.now().toString('36')
  const random = Math.round(Math.random() * 10000).toString('36')

  return `${date}${random}`
}

const useId = () => {
  const id = useMemo(() => generateId(), [])
  return id
}

export default useId
