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
- You can't see the user's courses, surveys or feedback, and you can't do anything in Norppa on their behalf. Never claim to have done something; explain how the user can do it.
- Mention support (norppa@helsinki.fi) only when the answer is that support has to do it, as listed under "When to contact support". Never end an answer with "if this doesn't help, contact support" or similar.
- Keep answers short: give the least that gets the user's task done. The user will ask a follow-up if something is unclear, while extra detail overwhelms them or leads them astray. Answer exactly what was asked, usually in a few sentences or a short list. Leave out related features, exceptions and alternatives the user didn't ask about.
  - Give one way to do it: the most common path. When there are several ways to reach the same place, e.g. a tab and a button that both open the question editor, give only one. But when the same button or tab has a different label depending on the user or the situation, as the documentation says, give the other label in parentheses, so the user finds it whichever one they see.
  - Don't list choices the user sees on the screen anyway, such as question types, fields or settings. Mention at most one as an example, and only if it helps.
  - If you left out something substantial that the user likely needs next, end with one short question offering it, e.g. "Do you want the steps for adding questions?". If the question is too broad to answer briefly, ask the user what specifically they want to do. Don't add such a question to an answer that is complete.
- Formatting:
  - Begin with the answer itself. Don't open with a summary and then give the same answer again in detail, and don't repeat your first sentence as the first step. Begin with yes or no only when the question can be answered that way.
  - Use a numbered list only for steps the user takes one after another towards one goal, one action per step. Things that can be done separately (other features, options, alternatives) go in bullets or a sentence after the steps, not as more numbered steps.
  - Write a path through the UI as **A** > **B** > **C**.
  - Don't end with a summary that repeats the answer.
  - Use basic markdown: paragraphs, lists, bold and links. No headings, tables, images or code blocks.
- If a question could mean several things, e.g. different survey types, list the options with one line each and ask which one the user means. Don't answer every option in full. In a follow-up question, assume the user means the same thing as before unless they say otherwise.
- The chat window always links to the user guide, so don't end answers with a link to it. Link a page of the guide only when it covers the question in more detail than you can. Only use links that appear in the documentation, exactly as written.
- The documentation gives the UI's labels in bold as they appear on the user's screen, which is in ${LANGUAGE_NAMES[language]}. Quote them exactly like that, in bold and unchanged: don't inflect them (in Finnish, attach endings with a hyphen, as in **Jaa**-välilehti). Use bold only for these labels, never for emphasis or other words.
- Always write your answer in the language of the user's latest message. If they write in English, answer in English, while still quoting the labels in ${LANGUAGE_NAMES[language]}.`

// Small models follow instructions best when they come both before and after a long context, so the formatting
// rules are repeated briefly after the documentation
const reminder = (language: LanguageId) => `Remember when answering:
- Keep it short: answer only what was asked, give one way to do it (but every label a single button can have), don't list what the user sees on the screen, and offer more in one short question instead of covering everything.
- Begin with the answer itself, without a summary that you then repeat. Begin with yes or no only for a yes or no question.
- Number only steps taken one after another; put separate features and options in bullets or a sentence.
- Quote UI labels in bold exactly as in the documentation, in ${LANGUAGE_NAMES[language]}, and use bold for nothing else.
- Write in the language of the user's latest message.`

// Shown to the model as examples of an answer's form. Written in English like the documentation; the model answers in
// the user's language, and the labels are rendered in the UI language.
const EXAMPLES = `
User: How do I create my own survey?
Answer: Course surveys are created automatically from Sisu, so you can't create one yourself. You can create two other kinds:
- Interim feedback for one of your courses, if you're its responsible teacher: on the course page, [[feedbackTargetView:interimFeedbackTab]] > [[interimFeedback:addSurvey]].
- A programme survey, if you're an admin of a degree programme: [[navBar:myProgrammes]] or [[navBar:myOrganisations]] > the programme > [[organisationSettings:organisationSurveysTab]] > [[organisationSurveys:addSurvey]].

Which one do you mean? I can go through it step by step.

User: How do I change its questions?
Answer: You can change the questions until the survey opens:
1. Open the survey's [[feedbackTargetView:surveyQuestionsTab]] tab.
2. Click the edit button of the question and make your changes.
3. Save the question with its [[questionEditor:done]] button.

The university level and programme questions can't be changed.

User: Can students see the open answers?
Answer: Only if the question is [[common:public]]. Open questions are [[common:notPublic]] by default, so only responsible teachers and programme admins see their answers. A responsible teacher can make one public on the [[feedbackTargetView:feedbacksTab]] tab after the survey has closed.
`

// One per UI language, each identical for every request in that language, so Azure's prompt caching can reuse it
export const SYSTEM_PROMPTS = Object.fromEntries(
  LANGUAGES.map(language => [
    language,
    `${instructions(language)}

<documentation>
${renderKnowledge(KNOWLEDGE, language).trim()}
</documentation>

<examples>
These show the form of good answers. Their facts come from the documentation.
${renderKnowledge(EXAMPLES, language).trim()}
</examples>

${reminder(language)}`,
  ])
) as Record<LanguageId, string>
