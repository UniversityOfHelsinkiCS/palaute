export const getLanguageValue = (values, preferred) => {
  const possibleLangs = ['fi', 'en', 'sv']

  if (values[preferred]) return values[preferred]

  // eslint-disable-next-line
  for (const lang of possibleLangs) {
    if (values[lang]) return values[lang]
  }

  return null
}

export const x = () => true
