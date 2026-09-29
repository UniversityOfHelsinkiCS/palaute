import { describe, expect, it } from 'vitest'

import { renderKnowledge, SYSTEM_PROMPTS, translate } from './systemPrompt'

describe('renderKnowledge', () => {
  it('replaces a key with its label in the UI language', () => {
    expect(renderKnowledge('Open [[navBar:myCourses]]', 'fi')).toBe(`Open **${translate('navBar:myCourses', 'fi')}**`)
    expect(renderKnowledge('Open [[navBar:myCourses]]', 'en')).toBe('Open **My surveys**')
  })

  it('uses the pinned language over the UI language', () => {
    expect(renderKnowledge('[[navBar:myCourses|en]]', 'fi')).toBe('**My surveys**')
  })

  it('drops comments', () => {
    expect(renderKnowledge('<!--\nNote for editors\n-->Text', 'en')).toBe('Text')
  })

  it('throws on an unknown key', () => {
    expect(() => renderKnowledge('[[navBar:noSuchKey]]', 'en')).toThrow('navBar:noSuchKey')
  })
})

describe('SYSTEM_PROMPTS', () => {
  it.each(['fi', 'sv', 'en'] as const)('resolves every label of knowledge.md in %s', language => {
    const prompt = SYSTEM_PROMPTS[language]

    expect(prompt).not.toMatch(/\[\[|<!--/)
    expect(prompt).toContain(`**${translate('navBar:courseSummary', language)}**`)
  })
})
