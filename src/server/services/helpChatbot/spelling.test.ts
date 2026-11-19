import { describe, expect, it } from 'vitest'

import { fixNorppaSpelling } from './spelling'

describe('fixNorppaSpelling', () => {
  it('fixes a doubled p before a closing ending', () => {
    expect(fixNorppaSpelling('Norppan tuki ja Norppassa, Norppasta, Norppalla')).toBe(
      'Norpan tuki ja Norpassa, Norpasta, Norpalla'
    )
  })

  it('fixes a single p before a vowel ending', () => {
    expect(fixNorppaSpelling('Kirjaudu Norpaan ja katso Norpaa.')).toBe('Kirjaudu Norppaan ja katso Norppaa.')
  })

  it('keeps clitics and lowercase', () => {
    expect(fixNorppaSpelling('Norppassakin ja norppan')).toBe('Norpassakin ja norpan')
  })

  it('fixes the name of the assistant', () => {
    expect(fixNorppaSpelling('Olen NorppaAI.')).toBe('Olen NorppAI.')
  })

  it('leaves correct forms, other languages and the domain alone', () => {
    const text = 'Norppa, Norpan, Norppaan, Norppana, NorppAI, Norppas, Norppa’s, norppa.helsinki.fi'
    expect(fixNorppaSpelling(text)).toBe(text)
  })
})
