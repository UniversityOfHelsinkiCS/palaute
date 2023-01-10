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
