import { useEffect, useRef } from 'react'

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
export const useDelayedTouched = (setTouched, value) => {
  const touchedTimeoutRef = useRef(null)

  // An answer that changes while the timer is pending was changed from outside the question,
  // e.g. by discarding changes. Marking it touched would then show an error the user did not cause.
  useEffect(() => {
    if (touchedTimeoutRef.current) {
      clearTimeout(touchedTimeoutRef.current)
      touchedTimeoutRef.current = null
    }
  }, [value])

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
