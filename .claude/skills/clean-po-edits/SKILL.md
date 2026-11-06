---
name: clean-po-edits
description: After the PO has edited the Finnish user guide or manual video captions, fix their typos and anything they broke, and mirror their changes into English. Use when asked to sync, mirror or apply the PO's guide changes.
---

# Sync the PO's user guide edits

The PO edits the Finnish user guide (`src/client/pages/UserGuide/content/fi`) and the captions in `e2e/manual/scenarios/*.manual.ts` directly on master. That is the intended workflow: the English follows afterwards.

## 1. Find what's new

- `git fetch`. If local master is behind origin, stop and ask the user to pull; never pull, rebase onto, or push to origin yourself.
- The base is the last commit titled `docs: apply PO changes to English user guide` (`git log --format=%h -1 --grep='^docs: apply PO changes to English user guide$'`).
- Review `git log --format='%h %an %s' <base>..HEAD` and `git diff --word-diff <base> HEAD -- src/client/pages/UserGuide/content/fi e2e/manual`. Read every hunk; nothing gets skipped.

## 2. Fix the Finnish

- Always run `npm run lint:quiet` and `npx vitest run src/client/pages/UserGuide`, and fix what they find in the PO's edits with the smallest change that keeps their wording. For example, an apostrophe inside a single-quoted caption gets double quotes, not a reworded sentence.
- Fix only typos and broken markup: misspellings, missing brackets or periods, double spaces, stray text around links. Never reword, restructure or undo the PO's edits.
- When the PO renames a section or page, update the link texts that quote the old title to the new one.
- Run `python3 .claude/skills/clean-po-edits/scripts/check_links.py <base>`: it lists links in both languages whose text quotes a title renamed since the base. Update each to the new title (in English, after step 3's renames). Link texts that differ from their target otherwise are deliberate: inflected into a sentence (`[tukeen]`), or naming the whole page while pointing at one of its sections.
- Commit: `docs: fix typos in Finnish user guide`.

## 3. Mirror into English

- Every Finnish change gets its English counterpart in the same file under `content/en`: changed sentences, added and removed text, renamed headings and titles, and link texts to renamed sections. Grammar-only Finnish fixes may need nothing.
- Write natural English, not a word-for-word translation. Keep the guide's terms: Sisu (not SISU), administrative person, feedback liaison, programme director, responsible teacher. Captions use the UI's "feedback correspondent". No em dashes.
- Captions where the PO also wrote the English: keep their English as is, fixing only typos and syntax.
- Afterwards, compare `git diff --word-diff <base> HEAD -- content/fi` with `git diff --word-diff -- content/en` file by file, and check every Finnish hunk has its counterpart.
- Commit the English and any caption changes together: `docs: apply PO changes to English user guide`.

## 4. Verify and report

- `npx vitest run src/client/pages/UserGuide`, `npm run lint -- --format=agent`, `npm run format`.
- The user accepts the PO's content choices. Only flag content that's critically wrong, such as wrong information on who can see answers or on anonymity, with a suggested one-line fix; don't apply it unasked.
- Report the commits made, and note that nothing was pushed.
