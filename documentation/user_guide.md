# User guide

An in-app user guide at `/guide` for teachers and degree programme staff, meant to replace the partly outdated guide on the wiki (`links:wikiRoot`).

## Visibility

- Behind `USER_GUIDE_ENABLED`: off in `config/default.js`, on in `config/hy.js`. The content is written for HY (Sisu, IAM groups, HY's support address), so other deployments shouldn't turn it on as is.
- Admins only until the content has been reviewed (`canSeeUserGuide.ts`, also used by the help chatbot).
- The chatbot's "Read the user guide" option and "Prefer to read?" strip open the guide when the user can see it, else the wiki (`useGuideLink`). The footer and the chatbot's answers still link to the wiki.

## Content

The pages are Markdown files in `src/client/pages/UserGuide/content/{fi,en}/`. **`content/README.md` has the rules for editing them**, e.g. UI labels as `[[section:key]]`, so the guide always quotes what's on the screen. Swedish users get the English text with Swedish labels.

The guide and the chatbot's `knowledge.md` are separate texts, one for people and one compressed for the model. When a fact changes, update both.

`content.test.ts` (in `npm run test:unit`) catches what editors can get wrong: a page or section missing in one language, labels that don't exist, broken links.

## How the content was written

From the wiki, the chatbot's `knowledge.md`, the code and the e2e tests, and checked against the code. Where the code and the old texts disagreed, the guide follows the code. Bugs found along the way are in `documentation/known_bugs.md`.

## Implementation

In `src/client/pages/UserGuide/`. The page is loaded lazily with all of its text, so moving between pages needs no loading.

- The menu's sticky position and the page's scroll padding use the header's height as a constant in `GuideMenu.tsx`, a stopgap until the app handles its sticky header itself. Banners, which make the header taller, put them off.
- The router doesn't scroll or move focus on navigation, so `useScrollToSection.ts` does: following a link goes to the top of the page or to the `#section` and focuses it. Back and forward leave the position to the browser.

## Later

- Open the guide to all staff once the content has been reviewed, and link it from the footer instead of the wiki.
- Swedish translation.
- Link the chatbot's answers to guide pages instead of the wiki.
- Search.
