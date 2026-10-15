# Help chatbot

NorppAI is an AI assistant that answers questions about using Norppa. It's an experimental MVP, shown to admins only. Code, routes and config call it the help chatbot; "NorppAI" is only for text users see. `NorppaFeedback` is unrelated: it's feedback about Norppa itself.

## Where things are

- Chat widget: `src/client/components/HelpChatbot/`, mounted in `AdUser.tsx` (it stays mounted across navigation, which is what keeps the conversation; a reload starts a new one).
- Chat API: `routes/helpChatbot/` and `services/helpChatbot/`. Admin viewer: `src/client/pages/Admin/tabs/HelpChatbot/` at `/admin/norppai`, with its API in `routes/helpChatbot/helpChatbotAdminController.ts` and queries in `services/helpChatbotAdmin/`.
- What the model knows: `services/helpChatbot/knowledge.md`, turned into the system prompt by `systemPrompt.ts`.
- Saved conversations: the `help_chatbot_turns` table, one row per question.

## Switching it off and on

- `HELP_CHATBOT_ENABLED` (off in `config/default.js`, on in `config/hy.js`) hides the whole feature. Changing it needs a redeploy.
- **In an emergency**, remove `AZURE_API_KEY` from the deployment: production then answers 503.
- Without Azure credentials, development uses `mockCompletion.ts`. In development it fails 15% of requests at random; put `#long`, `#slow`, `#fail` or `#failonce` in a question for a long answer, an 8 s wait, a failure, or a failure on the first try only.
- Rate limits (`rateLimit.ts`, Redis): 10 a minute and 100 a day per user, 2000 a day in total. If Redis is down, nothing is limited.
- Access is checked only for admins, on the client in `AdUser.tsx` and on the server in `helpChatbotController.ts`. Opening the chat to teachers means changing both. The viewer stays admins-only because it's mounted in the admin router.

## The model and its knowledge

Azure OpenAI, deployment `HELP_CHATBOT_MODEL` (default `gpt-5-mini`), with the same key and resource as gptwrapper.

In `knowledge.md`, `[[section:key]]` becomes the UI label in the user's language (`[[section:key|fi]]` in the given one), so answers quote what users see on screen. A missing key fails the tests. HTML comments are notes for editors and never reach the model. The file is read from the source tree at runtime, as `tsc` doesn't copy it to `build/`. Its own header comment has the rules for editing it.

## Saved turns

- **The server keeps the history.** The client sends `previousTurnId`, the last answer it showed, and the server follows `previous_turn_id` back through the conversation's answered turns. Failed questions, retries and answers the user never saw aren't on that chain, so the model never sees them.
- A conversation is identified by `conversation_id` **and** `user_id`, because the client makes up the id.
- A row is inserted as `pending` before the model is called. If that insert fails, the model isn't called. A row stuck at `pending` means the server stopped mid-request or couldn't save the answer; those tokens were billed but aren't recorded.
- `user_id` is whoever typed: during "login as", the admin. `metadata.impersonatedUserId` holds the user they were viewing as.
- **Tokens:** `cached_tokens` is part of `prompt_tokens`, and `reasoning_tokens` part of `completion_tokens`, so don't add them up. Prices go by `model` (the version Azure reports), not `deployment`. To change a price in `services/helpChatbotAdmin/prices.ts`, add an entry rather than editing the old one, as each turn is priced with the price valid when it was asked.
- **Privacy:** conversation content is saved only in this table. The logs get metadata only, and Sentry drops request bodies on `/help-chatbot/` URLs. No retention period has been decided; the content columns are nullable, so old rows can be cleared without losing the usage data.

## Viewer performance

With 200 000 turns, most views loaded in under 1.5 s, but searching (`ILIKE '%…%'`) took 6–7 s over 90 days. Add a `pg_trgm` GIN index on `question` and `answer` if that becomes a problem. The queries were tuned against those measurements, so don't undo these choices:

- The price join matches models with `LIKE`, not a regex, and costs are floats.
- The conversation list picks its page from the aggregates before looking up first questions and usernames.
- Conversations are counted in a query of their own.

## Frontend things that aren't obvious

- **One box, three views** (`pill`, `menu`, `chat`). CSS transitions between fixed sizes do the resizing. The pill's width and the menu's height are measured, because translations vary and deployments can override them.
- **Position:** the widget sits in a zero-height sticky root just above the footer, so it follows the viewport without scroll listeners (those stuttered).
- **The seal** is one element outside the box, played from a sprite sheet. The command that generates the sheet is in `sealSprite.ts`.
- **Layering:** the pill and menu sit below MUI modals. The open chat sits above them, dialogs are laid out beside it, and it stops the modal's focus trap from pulling focus out of it.
- **Dialog semantics:** the chat is a non-modal dialog. In full-screen it's modal (`aria-modal`), and the page behind it doesn't scroll. Full-screen applies below the `sm` breakpoint or under 640px viewport height.
- **Focus** moves explicitly on every view change, because the element the user activated disappears.
- **Screen readers:** answers and errors are announced through the widget's own polite live region, only while the chat is open.
- **Esc** is handled inside the widget and stopped, otherwise `EscSnackbarCloser` closes every snackbar too.
- **Accessible names:** buttons keep "Ask NorppAI" as their visible text and accessible name (WCAG 2.5.3). If the name needs a spoken form for screen readers, put it only in non-interactive text.
- **Answers render with `AnswerMarkdown`, not `common/Markdown.tsx`.** The common one renders links as plain `<a>`, so following one reloads the page and wipes the conversation. It also emits real `h1`s, and its `disallowImages` prop blanks every link's `href`.
