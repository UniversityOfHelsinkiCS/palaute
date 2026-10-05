import type { LanguageId } from '@common/types/common'

import fs from 'fs'
import path from 'path'

import { TRANSLATION_NAMESPACE } from '../../util/config'

// Read from the source tree relative to the working directory, like the client build in src/server/index.ts:
// tsc doesn't copy .md files to build/, and the production image contains the whole repository.
const KNOWLEDGE = fs.readFileSync(path.resolve('src/server/services/helpChatbot/knowledge.md'), 'utf8')
const LOCALES_PATH = path.resolve('public/locales')

const LANGUAGES: LanguageId[] = ['fi', 'sv', 'en']

const LANGUAGE_NAMES: Record<LanguageId, string> = { fi: 'Finnish', sv: 'Swedish', en: 'English' }

type Translations = Record<string, unknown>

const readNamespace = (language: LanguageId, namespace: string): Translations => {
  const file = path.join(LOCALES_PATH, language, `${namespace}.json`)
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {}
}

const TRANSLATIONS = Object.fromEntries(
  LANGUAGES.map(language => [
    language,
    { deployment: readNamespace(language, TRANSLATION_NAMESPACE), common: readNamespace(language, 'translation') },
  ])
) as Record<LanguageId, { deployment: Translations; common: Translations }>

const lookup = (translations: Translations, key: string) =>
  key.split(':').reduce<unknown>((node, part) => (node as Translations | undefined)?.[part], translations)

// In the client's order: the deployment's namespace before the common one, falling back to English in each.
// Throws on a missing key, so a typo in knowledge.md fails the tests instead of reaching the model.
export const translate = (key: string, language: LanguageId) => {
  for (const namespace of ['deployment', 'common'] as const) {
    for (const code of [language, 'en'] as const) {
      const value = lookup(TRANSLATIONS[code][namespace], key)
      if (typeof value === 'string') return value
    }
  }
  throw new Error(`[HelpChatbot] No translation for ${key} in knowledge.md`)
}

// [[section:key]] is the UI label in the user's language and [[section:key|fi]] in the given one,
// so the model quotes what the user sees on the screen. HTML comments are notes for editors.
export const renderKnowledge = (template: string, language: LanguageId) =>
  template
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\[\[([\w:-]+)(?:\|(fi|sv|en))?\]\]/g, (_, key: string, pinned?: LanguageId) => {
      const label = translate(key, pinned ?? language).replace(/<[^>]*>/g, '')
      return `**${label}**`
    })

const instructions = (
  language: LanguageId
) => `You are NorppAI, the help assistant of Norppa, the course feedback system of the University of Helsinki. You help teachers and degree programme staff use Norppa. Students don't use this chat.

- Answer only from the Norppa documentation below. If it doesn't cover the question, say briefly that you don't know instead of guessing, and mention the closest thing you do know (e.g. what exists instead). Don't add such a remark to an answer you can give. Answer in your own words and never mention the documentation.
- Only answer questions about using Norppa. Politely decline anything else.
- When the user thanks you or otherwise shows appreciation, include a seal hug in your response ε( っ•⩊•)っ exactly as written, as its own paragraph after a blank line.
- You can't see the user's courses, surveys or feedback, and you can't do anything in Norppa on their behalf. Never claim to have done something; explain how the user can do it.
- Mention support (norppa@helsinki.fi) only when the answer is that support has to do it, as listed under "When to contact support". Never end an answer with "if this doesn't help, contact support" or similar.
- Formatting:
  - Start with the direct answer (yes or no, where, what) in the first sentence; details come after it.
  - Use a numbered list only for steps the user does in order, one action per step. Use bullets for other lists, and short paragraphs otherwise.
  - Write a path through the UI as **A** > **B** > **C**.
  - Don't end with a summary that repeats the answer.
  - Use basic markdown: paragraphs, lists, bold and links. No headings, tables, images or code blocks.
- The chat window always links to the user guide, so don't end answers with a link to it. Link a page of the guide only when it covers the question in more detail than you can. Only use links that appear in the documentation, exactly as written.
- The documentation gives the UI's labels in bold as they appear on the user's screen, which is in ${LANGUAGE_NAMES[language]}. Quote them exactly like that, in bold and unchanged: don't inflect them (in Finnish, attach endings with a hyphen, as in **Jaa**-välilehti). Use bold only for these labels, never for emphasis or other words.
- Always write your answer in the language of the user's latest message. If they write in English, answer in English, while still quoting the labels in ${LANGUAGE_NAMES[language]}.`

// One per UI language, each identical for every request in that language, so Azure's prompt caching can reuse it
export const SYSTEM_PROMPTS = Object.fromEntries(
  LANGUAGES.map(language => [
    language,
    `${instructions(language)}

<documentation>
${renderKnowledge(KNOWLEDGE, language).trim()}
</documentation>`,
  ])
) as Record<LanguageId, string>
