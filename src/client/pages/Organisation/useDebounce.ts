import { useEffect, useState } from 'react'

// adopted from https://github.com/uidotdev/usehooks/blob/9cdf2fb7b5dffc9a3ff78081cc85363ce0d04e66/index.js#L239
export function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
