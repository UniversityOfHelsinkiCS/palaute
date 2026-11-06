---
name: sync-guide-and-knowledge
description: Bring the in-app user guide and NorppAI's knowledge base up to date with the code changed since the last run. Use when asked to sync, update or check the user guide or the chatbot's knowledge against the code. Not for the PO's own guide edits; that's clean-po-edits.
---

# Sync the user guide and knowledge base with the code

The documents are `src/server/services/helpChatbot/knowledge.md` and the guide in `src/client/pages/UserGuide/content/{fi,en}`. Read the rules for each before starting: the header comment of `knowledge.md` and `content/README.md`.

## Scope

- Every change that non-admin users at HY can see ends as either documented or decided not to be. Nothing is deferred. Admin-only features are out of scope for both documents.
- Students' side counts when it changes what staff tell students or should expect of them.
- The two documents have different bars: the knowledge base covers edge cases, as the chatbot can't see the screen; the guide leaves out what doesn't affect what the user does. One change may need an edit in only one of them.
- Only this repo's code is covered, not the importer, the updater or Sisu data.

## 1. Start

- Run on `master` with a clean tree. `git fetch`; if `master` is behind `origin/master`, stop and ask the user to pull. Never pull, rebase or push yourself.
- `python3 .claude/skills/sync-guide-and-knowledge/scripts/changes.py`. If it lists Finnish guide edits not yet mirrored into English, stop and tell the user to run clean-po-edits first.
- It lists the commits since `last_synced` that touch more than tests, tooling, docs and admin-only code. Note the HEAD it prints: the run reviews up to it.

## 2. Triage

- Read every listed commit; nothing gets skipped. Judge the net change (`git diff <base> <head> -- <files>`) and use the commits for intent: what was reworked or reverted within the range counts only in its end state.
- For each change users can see, grep both documents for its labels (`[[section:key]]`), terms and behaviour, and decide: edit, add, remove or no doc impact. Don't re-check facts the range didn't touch.
- Renamed labels update themselves. Check prose that paraphrases a changed label, and removed keys that the documents use.
- Check what HY users can reach (`config/hy.js`, the role that gates it), as the document rules say.
- Grep `e2e/manual/scenarios` captions for UI that changed, to report them.
- For a large range, read-only Explore agents may triage areas in parallel (e.g. server, client, translations), returning candidate changes with their commits and files. Make every edit yourself.

## 3. Ask

After triage, ask all open questions at once with AskUserQuestion (4 per call), each option previewing its proposed text in both languages, or an outline for a new page. Ask only:

- whether to document a change users can see, when that isn't clear
- adding or removing a section or page
- whether behaviour is intended or a bug (a bug goes in `documentation/known_bugs.md`, not the documents)
- a change whose effect on users can't be told from the code

Apply clear factual updates without asking. Once the user has decided about a feature, don't ask about its other commits.

## 4. Edit

- Change the smallest unit that's wrong. Leave the wording around it alone; no restyling or reorganising. A new fact goes in its existing section.
- Add a section or page when a feature has no fitting home, and fix what it makes wrong elsewhere: counts, lists, comparisons, links. A removed feature loses its whole section and the links to it.
- Edit both languages. The PO owns the Finnish wording: change only the fact in it.
- Guide terms: Sisu (not SISU), administrative person, feedback liaison, programme director, responsible teacher. No em dashes.

## 5. Fact-check

Spawn one general-purpose agent, giving it the documents' diff and not your triage. Ask it to check each added or changed statement against the code at HEAD, and only those: supported, wrong or unsupported, with `file:line` evidence, including the roles, survey types and HY reachability the statement claims, and that the Finnish says the same as the English. Fix what it shows wrong; put anything disputed to the user.

## 6. Verify and commit

- `npx vitest run src/client/pages/UserGuide src/server/services/helpChatbot`, `npm run lint -- --format=agent`, `npm run format`.
- Write the HEAD from step 1 into `last_synced`, and commit it with the document changes: `docs: sync user guide and knowledge base with code`.
- `git fetch`; if `origin/master` has moved, tell the user to rebase before pushing.

## 7. Report

- Each change with its commits: the edit made (file and section), or no doc impact and why. New and removed sections separately.
- Captions to update, the fact-check's outcome, the commit, and that nothing was pushed.
