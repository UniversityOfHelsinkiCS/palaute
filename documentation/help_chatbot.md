# Help chatbot

An AI assistant that answers teachers' questions about using Norppa, e.g. "How do I add a question to my feedback survey?" or "Where can I see the responses to my survey?".

This is an experimental MVP. The goal is to learn what makes this kind of feature useful to our users. This draft covers the **frontend only**; the backend is a placeholder that fakes the agreed contract.

## Principles

- **A convenience, never a push.** The user guide must always be clearly reachable, both from the help button and from inside the chat. Nobody should feel forced to use the AI.
- **Accessibility is a primary focus**, not polish. The chat must meet the same WCAG 2.1 AA bar we hold the rest of Norppa to (see [accessibility.md](accessibility.md)).
- **Answers only.** The assistant explains and links to the user guide; it never performs actions on the user's behalf.

## Scope of the MVP

### Visibility

- Visible to **admin users only** for now.
- The whole feature can be switched off per deployment with the `HELP_CHATBOT_ENABLED` config flag (off in `config/default.js`, on in `config/hy.js`). Changing it requires a redeploy; there is no runtime toggle.
- The target audience is teachers; a student-facing version would be a separate, more restricted feature.

### Visual reference

The agreed look and behaviour are in the [prototype canvas](https://claude.ai/artifact/SkrKoiooPjbGVmAWQXhpjE) (private; share it from its Share menu before pointing others at it). Its sizes, colours, spacing, copy and animation timings carry over to the implementation. Chat answers there are placeholders, and its auto-scroll and focus handling don't work in the prototype runtime; they are specified below instead.

### The assistant: NorppAI

- The assistant is called **NorppAI**, with the Norppa seal as its mascot. Text that refers to the app itself still says "Norppa".
- **The small seal is one continuous character.** It travels with the widget: in the pill, then on the "Ask NorppAI" option, then in the chat header. It is never duplicated: there's no avatar next to replies.
- The only other seal is a **large seal in the empty state's greeting**. It disappears once the conversation starts.

### One widget, three views

The help button, menu and chat are **one box** anchored to the bottom-right corner. It changes size between views; it doesn't open separate popups.

1. **Closed: a pill** reading "Need help?" with the seal.
   - White background, 1px `#dde3ea` border, subtle shadow; text deep blue `#1f4f8c`, semibold, 14.5px.
   - Hover: very faint blue background `#f1f6fc`, border `#c3d3e6`. No underline or other link styling.
2. **Menu.** Clicking the pill plays the seal animation once while the pill grows into the menu:
   - Title "How would you like to get help?" and a × button that closes the menu.
   - **Read the user guide** (opens the wiki in a new tab and closes the menu).
   - **Ask NorppAI** as the bottom option, where the pill was. The seal slides onto it as its icon.
   - The menu closes only with ×, Esc or by picking an option, not by clicking elsewhere on the page.
3. **Chat.** "Ask NorppAI" grows the same box into the chat window, and the seal slides into the header.
   - Closing the chat (× or Esc) shrinks it back to the pill. Closing never clears state: the conversation, the unsent draft, the expanded size and any pending request are all kept.
   - Clicking elsewhere on the page does not close the chat.

### Chat panel

- Opened over the page so the user can keep looking at the page they are asking about.
- **Fixed size with an expand toggle** for long answers. On small screens / high zoom the panel is full-screen (WCAG 1.4.10 Reflow).
- Header: the seal, "Ask NorppAI", then **New conversation**, **Expand/Shrink** and **Close** icon buttons.
- Below the header, an always-visible strip: "Prefer to read? Open the user guide".
- The conversation **persists across in-app navigation**. A reload or new tab starts fresh.

### Empty state

- A large seal (72px, decorative) above a short greeting ("Hi, I'm NorppAI!") explaining what the assistant can and cannot help with.
- A one-line disclaimer: answers are AI-generated and may be wrong; check the user guide when in doubt.

### Messages

- User messages on the right in a light blue bubble, NorppAI's replies on the left in a light grey bubble.
- Replies arrive **whole** (no streaming). While waiting, "NorppAI is thinking…" shows under the last message and the header seal loops its animation. When the reply arrives, the loop finishes its current cycle instead of snapping back.
  - The service contract should not assume "one request = one finished message" so deeply that streaming could not be added later.
- Assistant replies render as **basic markdown with links**, so links to the user guide work. User messages render as plain text.
- Sending is disabled while a reply is pending.
- A failed request shows "No answer received." with a Retry button under that message.
  - Only the latest failed message offers Retry; older failures keep the text without the button.
  - Failed questions are not sent to the backend as conversation history.
  - All errors show the same text, whatever their cause.
- A reply that arrives while the chat is closed is added to the conversation silently: no announcement, no animation. Closing the chat means the user isn't waiting for it.
- **Auto-scroll (required):**
  - Sending a message or retrying scrolls to the bottom, so the message and the waiting indicator are visible.
  - When a reply arrives, scroll to the **start** of the reply, so a long answer is shown from its beginning.
  - Reopening the chat scrolls to the latest message.
  - Smooth scrolling, except with `prefers-reduced-motion`.

### Input

- Enter sends, Shift+Enter inserts a newline. The field grows with its content up to a maximum height.
- Maximum length 500, with a character counter shown from 400 characters.
- Focus style: a single solid 2px primary-colour border, as in MUI's outlined text fields, shown only while the text area itself is focused.

### Language

- All static UI text (buttons, greeting, disclaimer, errors) follows the user's UI language (fi/sv/en).
- Chat content may be in any language; the LLM will answer in the language the question was asked in. This is intentional and not a frontend concern.

### User guide link

- There is no in-app help page. All help links point to the **existing user guide on the wiki**, the same one the footer links to ("Käyttöohje").
- It is a different service, so links open in a **new tab**, with the usual "opens in a new tab" indication.
  - The menu's "Read the user guide" option already says "Opens the wiki in a new tab" in its visible description, so it gets no extra icon or hidden text. Everywhere else, use `ExternalLink`.
- The assistant's replies may link to specific pages of the guide.
- **Deployments without a user guide** (`links:wikiRoot` is not an http(s) URL, e.g. `-`): all guide links are hidden, the pill opens the chat directly (a menu with one option is pointless), and the disclaimer drops its "check the user guide" sentence.

### Placeholder backend

- A fake service behind the same interface the real backend will use.
- Should fake realistic behaviour, not just the happy path: variable latency, occasional failures, replies containing markdown and links to the user guide.
- The request/response contract is a placeholder until the real backend is designed. It is confined to `src/common/types/helpChatbot.ts` and the service module, so changing it doesn't ripple through the UI.

### Backend integration

Everything backend-specific is behind one seam, `src/client/components/HelpChatbot/helpChatbotService.ts`. The rest of the module only uses its exports:

- `askNorppai(conversationId, entries, signal)` → `{ id, markdown }`. `entries` is the chat's own model (`HelpChatbot/types.ts`) and ends with the question being asked; the service turns it into whatever the backend wants. Any rejection shows "No answer received".
- `isCancelled(error)`: recognises a request aborted through `signal` (New conversation aborts it). It already handles axios cancellation.

To plug in the real backend:

1. Replace the mock call in `askNorppai` with an `apiClient` request, passing `signal`. Map the request and response there.
2. Change `src/common/types/helpChatbot.ts` to the real contract. The current shape is a placeholder; nothing outside the service depends on it.
3. Delete `mockHelpChatbotService.ts`.

Only if the backend's model differs from the one above does anything else change, and then only `useConversation.ts`: for example, a server-issued conversation id (today the client generates one per conversation) or streaming replies (the assistant entry's `markdown` would grow while a new `'streaming'` status is shown).

## Accessibility requirements

- The widget is wrapped in an `<aside>` landmark labelled "Help", so screen reader users can jump to it without tabbing through the page.
- The chat is a **non-modal dialog** with an accessible name.
  - Exception: in the full-screen layout the panel covers the page, so it becomes modal (`aria-modal` and a focus trap). Tab can't leave it for content hidden behind it, and the page doesn't scroll behind it (the layout uses `100vw`, which includes the scrollbar).
- **Focus moves on every view change**, because the element the user activated disappears:
  - Opening the menu moves focus to "Ask NorppAI".
  - Opening the chat moves focus to the input.
  - Closing the menu or the chat (× or Esc) returns focus to the pill.
  - Sending with the Send button, Retry, and New conversation move focus to the input (the button is disabled or removed).
- New assistant replies are announced in full through a **polite live region** (WCAG 4.1.3 Status Messages), but only while the chat is open. Errors are announced as well.
- The Expand toggle keeps one accessible name ("Expand chat") and exposes its state with `aria-pressed`; screen readers announce a state change reliably but often miss a name change on the focused button. The icon and tooltip switch between expand and shrink.
- Icon buttons have a tooltip with the same text as their accessible name.
- The waiting indicator is text ("NorppAI is thinking…"); the seal animation is decorative. The text pulses between `text.secondary` and `text.primary`: fading it out would drop it below 4.5:1 contrast.
- With `prefers-reduced-motion`, the resize transitions, the seal's slide and all seal animations are switched off (WCAG 2.2.2).
- The pill, menu, panel controls and message links are fully keyboard operable, with unique accessible names.
- The input's focus style also shows in Windows high-contrast mode (a transparent outline as a fallback for the box-shadow).
- Check how screen readers pronounce "NorppAI" in fi/sv/en. If it comes out badly, give the name a spoken form, but only in non-interactive text (the chat heading, the live region, the hidden "NorppAI:" prefixes). Button and link names must keep the visible text (WCAG 2.5.3 Label in Name), so voice control commands like "click Ask NorppAI" keep working.
- Full-screen layout on small viewports / 400% zoom without loss of content. Full-screen applies below the `sm` breakpoint or below a 640px viewport height. Below 400px height the whole panel scrolls as one, so the header and input don't take up all the space. The header stays sticky there, since the seal in it is fixed to the viewport.
- Tested manually with keyboard and a screen reader, plus WAVE/Lighthouse. No automated tests in the MVP.

## Later (out of scope for the MVP)

- Links from answers to places in the app (e.g. directly to a survey's results).
- Thumbs up/down feedback on answers.
- Recording/reviewing conversations to evaluate usefulness.
- Sending the user's current page as context with each message. This needs a routing rework (e.g. a data router with `useMatches`); a hand-maintained route table is not worth it.
- An in-app help page, possibly sharing a source with the assistant's knowledge document.
- Streaming replies and a "stop generating" control.
- Suggested starter questions, possibly varying by the current page.
- Copy-answer button.
- Rollout beyond admins; a student-facing version.
- Behaviour while an admin is impersonating another user.
- Automated tests. Robust testing belongs with the real backend implementation.

## Implementation notes

The feature is built as a self-contained module (e.g. `src/client/components/HelpChatbot/`) with a small public surface. Its internals deliberately do **not** follow legacy patterns in the rest of the client. It does share the app's foundations: MUI theme, i18n, router and auth.

### Integration points

- **Feature flag:** `HELP_CHATBOT_ENABLED` in `config/default.js` / `config/hy.js`, exported from `src/client/util/common.ts` like `PUBLIC_COURSE_BROWSER_ENABLED`.
- **Mounting:** in `src/client/pages/AdUser.tsx`, as a sibling of `<DevTools />`, rendered only when the flag is on and `authorizedUser?.isAdmin === true`. AdUser stays mounted across in-app navigation and resets on reload, which gives the required persistence with plain component state or a small context (memoize the context value; `react/jsx-no-constructed-context-values` is a lint error).
- **Admin check:** `useAuthorizedUser()` → `authorizedUser?.isAdmin`. `isAdmin` is missing from `GetLoginResponse` in `src/common/types/user.ts` even though the server sends it; add it.
- **User guide link:** reuse the existing `links:wikiRoot` translation key (the real URL comes from the deployment's `hy.json` override) and render it with `ExternalLink`.
- **i18n:** a new top-level `helpChatbot` group in `public/locales/{fi,sv,en}/translation.json`. Note the separators: `t('helpChatbot:someKey')`. Check with `npm run translations`; its file matcher in `tools/analyzeTranslations.js` is widened to include `.ts`/`.tsx`, which it previously skipped.
- **Font:** the pill label and links use semibold (600), so weight 600 is added to the Open Sans link in `index.html`.
- **Mock backend:** there is no MSW or similar. Write a plain async service module (random latency, occasional failures, markdown replies with user guide links) called from a TanStack Query `useMutation`, so it can later be replaced with an `apiClient.post`. Request/response types go in `src/common/types/`.

### Conventions to follow

- New files are `.ts`/`.tsx`: `type` over `interface`, separate `import type` lines, no `as` casts, arrow functions. Write them strict-clean even though the client's `tsconfig` has `strict: false`.
- Use theme tokens (palette, zIndex, breakpoints), not hard-coded values: deployments can supply a custom theme. Use theme breakpoints for the full-screen layout, not `useIsMobile` (hard-coded 1000px).
  - The prototype's colours map to existing tokens where one fits (e.g. `primary.dark` for the pill text, `divider` for borders). Its light blue tints are derived from `primary.main` with `alpha()`, so a custom theme recolours the widget automatically. Small deviations from the prototype's exact hex values are accepted.
  - New palette entries are added only if a deployment needs to override a colour independently.
- Show chat errors inline; don't use `useInteractiveMutation`, which reports through snackbars.
- Style with `sx`, and merge with `mergeSx` from `src/client/util/sx.ts`.
- Use `NorButton`, `focusIndicatorStyle()` from `src/client/util/accessibility.ts` and `ExternalLink` for external links. Icon buttons use `IconButton` + `focusIndicatorStyle()` + `disableFocusRipple` + an `aria-label`.
- Generate ids with React's `useId`, not `src/client/hooks/useId.ts`.
- Use `visuallyHidden` from `@mui/utils` without the legacy `width/height: 0` override.
- Accessible names put the visible text first (WCAG 2.5.3).
- Message list: `<Box component="ul" role="list">` with `li` items.

### Widget animation

Findings from the prototype. They keep the animation simple to build and maintain:

- **One component, one view state** (`closed | menu | chat`, plus expanded/full-screen) and a table of **fixed box sizes** per view. Plain CSS transitions on width, height and border radius animate between them. There's no DOM measuring and no animation library.
- Each view's content fades in after the resize. The chat content is laid out at its final size, so it's clipped during the growth instead of reflowing.
- **The widget sits in a zero-height sticky root** just above the page footer, so it rides along the viewport's bottom edge and stops above the footer, without scroll listeners (updating the position from a scroll listener stuttered while smooth scrolling). The root's sticky `top` keeps the pill and the menu from being pushed past the top of the viewport. The chat pins the root to the viewport's bottom, so it covers the footer rather than the NavBar. The full-screen chat is positioned in the same root, so switching to it doesn't make the box jump.
- **The seal is a single element outside the resizing box**, positioned from the widget's bottom-right corner with a `transform`. Positioning it relative to the box made it jump ahead of the box's resize animation.
- **The seal animation is a sprite sheet** of all 77 GIF frames, played with a CSS `steps(77)` animation over 2.31s: once on the pill click, looped while waiting for a reply. JavaScript only toggles a class; driving frames from React state stuttered.
  - The source is `public/seal.gif` (77 frames of 30 ms each, so `steps(77)` over 2.31s matches its timing).
  - The sheet is a committed WebP in the module's `assets/` folder, generated once with ImageMagick (`-coalesce` is required because the GIF's frames are partial). The command is kept in a comment next to its import.
  - It is a 6160×80 strip (80px frames for sharpness at 2× DPR), about 86 KB against the prototype PNG's 450 KB.
  - The large greeting seal uses a second 11088×144 strip (144px frames, about 157 KB). Its first frame is the still image. Clicking it is an easter egg: the seal bounces and plays the animation once. It's hidden from keyboard and screen reader users, and does nothing with `prefers-reduced-motion`.
- **The pill's width must be a number** so it can animate, but the label's length varies by language, and translations can be overridden per deployment. The label is measured with a `ResizeObserver`, which also follows font loading and user text-spacing overrides (WCAG 1.4.12). A fixed width per language would silently break when the copy changes.
- **The menu's height is measured the same way.** Its width is fixed, but a fixed height clipped the title and the guide option's description under WCAG 1.4.12 text spacing. The seal's slot is in the bottom option, so its position doesn't depend on the height.
- The expanded and full-screen sizes are CSS expressions (`min(680px, 100dvh - 48px)`, `100vw`), so the size table stays declarative and fits smaller viewports without measuring.

### Pitfalls found in the existing code

- **Don't build the panel on MUI `Dialog`**, which is always modal. Use a fixed-position `Paper`/`Popper` with `role="dialog"` and `aria-labelledby`. An open MUI modal elsewhere sets `aria-hidden` on the panel; that's acceptable, but announcements made during it are lost.
- **Own live region:** the panel owns an always-mounted polite region; don't reuse the snackbar announcer. Replace the text, then clear it after a delay so repeated messages are announced again.
- **Focus management:** follow `EditFeedbackTarget.jsx`: move focus after the new view has rendered, explicitly, per the rules above. No `setTimeout` focus hacks.
- **Global key listeners:** `EscSnackbarCloser` closes all snackbars on any Esc, so handle Esc inside the panel and stop propagation. The Alt+T chart/table toggle in `Results.jsx` doesn't ignore text inputs, so it fires while typing in the chat. Fix that listener to ignore editable targets.
- **Markdown:** `components/common/Markdown.tsx` renders links as plain `<a href>` (a full page reload wipes the conversation and skips `basePath`) and emits real `h1`–`h4`. Pass custom `components`: `ExternalLink` for external links (the wiki), router `Link` for any internal ones, and demote headings. Passing `components` replaces all its defaults, so pass a full set. Don't use its `disallowImages` prop: it replaces `urlTransform` with `() => ''`, which blanks every link's `href` too. Use `disallowedElements={['img']}` instead.
- **Layering:** `FixedContainer` toolbars (z-index 999), skip links (1300) and the notistack container (1400) are fixed-position. Check that the button and panel don't collide with them.
