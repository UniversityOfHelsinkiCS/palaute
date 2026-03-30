import { useRef } from 'react'

const dontKnow = { en: 'N/A', sv: 'N/A', fi: 'eos' }

export const getDontKnowOption = (values, preferred) => {
  if (!values) {
    return null
  }

  const possibleLangs = ['fi', 'en', 'sv']

  if (values[preferred]) return dontKnow[preferred]

  // eslint-disable-next-line
  for (const lang of possibleLangs) {
    if (values[lang]) return dontKnow[lang]
  }

  return null
}

// Custom hook for delayed validation to prevent premature error display during keyboard navigation
export const useDelayedTouched = setTouched => {
  const touchedTimeoutRef = useRef(null)

  const handleGroupBlur = () => {
    if (touchedTimeoutRef.current) {
      clearTimeout(touchedTimeoutRef.current)
    }

    touchedTimeoutRef.current = setTimeout(() => {
      setTouched(true)
    }, 100)
  }

  const handleGroupFocus = () => {
    if (touchedTimeoutRef.current) {
      clearTimeout(touchedTimeoutRef.current)
      touchedTimeoutRef.current = null
    }
  }

  return {
    handleGroupBlur,
    handleGroupFocus,
  }
}
