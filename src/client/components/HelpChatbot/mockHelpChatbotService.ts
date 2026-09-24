import type { PostHelpChatbotMessageBody, PostHelpChatbotMessageResponse } from '@common/types/helpChatbot'

// Placeholder backend. Test triggers in the question: #long for a long answer, #slow for an 8 s reply,
// #fail to always fail and #failonce to fail only the first attempt.

const GUIDE = 'https://wiki.helsinki.fi/xwiki/bin/view/CF/Course%20feedback/'
const TEACHER_GUIDE = `${GUIDE}3.%20Teacher%27s%20guide/`

const QUESTIONS_REPLY = `You can add questions to your feedback survey on the course's feedback page:

1. Open the course from **My teaching**.
2. Go to the **Edit survey** tab.
3. Click **Add question** and pick a question type.
4. Write the question and save your changes.

The [Teacher's guide](${TEACHER_GUIDE}) has more on the different question types.`

const RESPONSES_REPLY = `Responses are on the course's feedback page, under the **Feedback** tab. You'll see a summary of each question, and the open answers below it.

See the [Teacher's guide](${TEACHER_GUIDE}) for how to download the responses or reply to them.`

const LONG_REPLY = `# Setting up course feedback

Course feedback in Norppa has a few stages. Here is an overview of each of them.

## Before the feedback period

You can find your courses in [My teaching](/courses). Each course has a feedback survey that combines university-level, programme-level and your own questions.

- The university-level and programme-level questions can't be edited.
- You can add your own questions and reorder them.
- You can change the dates of the feedback period.

## During the feedback period

Students can give feedback while the period is open. You can follow the response rate on the course's feedback page, and send a reminder to students who haven't answered yet.

### Reminders

A reminder is sent as an email. Write a short message explaining why feedback matters to you; students are more likely to answer a personal message.

## After the feedback period

Once the period closes, you can read the responses and write a counter-feedback to your students. Counter-feedback tells students what you will change based on their feedback.

The [user guide](${GUIDE}) covers every stage in more detail.`

const DEFAULT_REPLY = `I'm a placeholder, so I only know a few sample answers. Try asking how to add a question to your survey, or where to find the responses.

Everything else is in the [user guide](${GUIDE}).`

const replyTo = (question: string) => {
  const q = question.toLowerCase()
  if (q.includes('#long')) return LONG_REPLY
  if (/question|survey|kysym|kysely|fråg|enkät/.test(q)) return QUESTIONS_REPLY
  if (/respons|result|answer|vastau|tulos|palaut|svar|resultat/.test(q)) return RESPONSES_REPLY
  return DEFAULT_REPLY
}

const FAILURE_RATE = 0.15

// Conversation and question pairs that have already failed once with #failonce
const failedOnce = new Set<string>()

const shouldFail = (conversationId: string, question: string) => {
  if (question.includes('#fail') && !question.includes('#failonce')) return true
  if (question.includes('#failonce')) {
    const key = `${conversationId}:${question}`
    if (failedOnce.has(key)) return false
    failedOnce.add(key)
    return true
  }
  return Math.random() < FAILURE_RATE
}

// Mostly 0.7–2.5 s, sometimes 6–8 s
const randomLatency = () => (Math.random() < 0.1 ? 6000 + Math.random() * 2000 : 700 + Math.random() * 1800)

const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const abort = () => {
      window.clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    const timer = window.setTimeout(() => {
      signal?.removeEventListener('abort', abort)
      resolve()
    }, ms)
    if (signal?.aborted) abort()
    signal?.addEventListener('abort', abort, { once: true })
  })

export const mockSendHelpChatbotMessage = async (
  { conversationId, messages }: PostHelpChatbotMessageBody,
  options?: { signal?: AbortSignal }
): Promise<PostHelpChatbotMessageResponse> => {
  const question = messages.at(-1)?.content ?? ''
  await wait(question.includes('#slow') ? 8000 : randomLatency(), options?.signal)
  if (shouldFail(conversationId, question)) throw new Error('Mock failure')
  return { message: { id: crypto.randomUUID(), role: 'assistant', content: replyTo(question) } }
}
