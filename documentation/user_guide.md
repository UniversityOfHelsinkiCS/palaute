# User guide

An in-app user guide at `/guide`, for teachers and degree programme staff. It's meant to replace the old user guide on the wiki (`links:wikiRoot`), which is partly outdated.

## Visibility

- Behind the `USER_GUIDE_ENABLED` config flag: off in `config/default.js`, on in `config/hy.js`. The content is written for HY (Sisu, IAM groups, HY's support address), so other deployments shouldn't turn it on as is.
- Admins only, like the help chatbot, until the content has been reviewed. The check is `canSeeUserGuide` in `src/client/pages/UserGuide/canSeeUserGuide.ts`, used by both the page and the chatbot.
- The help chatbot's "Read the user guide" option and its "Prefer to read?" strip open the guide in the same tab when the user can see it, else the wiki in a new tab (`useGuideLink`). The footer still links to the wiki. The chatbot's answers still link to the wiki (`knowledge.md`'s "User guide pages").

## Content

The pages are Markdown files in `src/client/pages/UserGuide/content/{fi,en}/`. **`content/README.md` has the rules for editing them.** In short:

- One file per page, `<order>-<slug>.md`, in both languages. Swedish users get the English text.
- `[[section:key]]` renders a UI label in the user's language, as in the chatbot's `knowledge.md`, so the guide quotes what the user sees even when the labels change.
- `## Heading {#id}` gives a section a stable id to link to, the same in both languages. The menu lists the open page's `##` sections.
- No images or tables.

The content was written from the wiki, the chatbot's `knowledge.md`, the code and the e2e tests, and checked against the code. The guide and `knowledge.md` are separate texts: the guide is for people and the knowledge base is compressed for the model. When a fact changes, update both.

`src/client/pages/UserGuide/content.test.ts` (in `npm run test:unit`) checks that every page exists in both languages with the same section ids, titles and `##` sections are plain text and sections have unique ids, every label key exists, and every link to the guide points to a page and section that exist.

## Implementation

In `src/client/pages/UserGuide/`, loaded lazily (`React.lazy` in `Router.tsx`), so the text is downloaded only by those who open the guide:

- Content: `content.ts` reads the Markdown files with `import.meta.glob` and parses them into pages with titles and sections; it also defines the guide's additions to Markdown (labels, heading ids). `GuideMarkdown.tsx` renders a page with the common `Markdown` component: labels, heading ids (a small rehype plugin), router links within Norppa, `ExternalLink` for other sites.
- Page: `UserGuide.tsx` checks access and finds the page, and lays out `GuideMenu.tsx` (pages and the open page's sections) beside the page and `PageNavigation.tsx` (previous and next).
- The menu sticks below the app's sticky header, and the page's scroll padding keeps linked sections and keyboard focus below it. Both use the header's height as a constant in `GuideMenu.tsx`, a stopgap until the app handles its sticky header itself.
- `useScrollToSection.ts`: moving to another page starts from its top and focuses its title, so screen reader users start from the new page. A link with a `#section` scrolls to that section and focuses its heading.
- `useActiveSection.ts`: the menu highlights the section being read, i.e. the last one whose heading has scrolled up to the header, or the last one at the end of the page.

## Later

- Open the guide to all staff once the content has been reviewed, and link it from the footer instead of the wiki.
- Link the chatbot's answers to guide pages instead of the wiki.
- Search.
