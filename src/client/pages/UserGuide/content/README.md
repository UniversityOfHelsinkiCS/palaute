# User guide content

The in-app user guide (`/guide`). Each page is one Markdown file, in Finnish in `fi/` and in English in `en/`. Swedish users get the English text with the UI labels in Swedish. See `documentation/user_guide.md` for how the guide works.

`npm run test:unit` checks the content: run it after editing.

## Files

- Each page is in a group folder, `<order>-<group>/<order>-<slug>.md`, e.g. `2-teachers/05-counter-feedback.md`. The orders set the group's and the page's place in the menu, the slug the page's address (`/guide/counter-feedback`), so it must be unique across groups. Use the same file name in both languages.
- The menu shows each group under the heading `userGuide:groups:<group>` from the translations. The groups:
  - `general`: what applies to everyone, such as rules, terms and the course summary. No steps for working with a survey.
  - `teachers`: working with a survey, from its dates to counter feedback. Programme surveys and programme admins use these pages too, so say where they differ.
  - `programmes`: the programme's page and programme surveys.
- Each page starts with one `# Title`, which is also its name in the menu. Don't put labels in the title.
- Write the same pages, sections and section ids in both languages. The texts don't have to be word-for-word translations.

## Writing

- Write for teachers and degree programme staff at the University of Helsinki, not for developers.
- Check every fact against the code. The old user guide on the wiki is partly outdated; the help chatbot's knowledge base (`src/server/services/helpChatbot/knowledge.md`) has been checked against the code, so if the two differ, fix it there as well.
- Only describe what users at HY can acually reach: check the config (`config/hy.js`) and the role that gates a feature, not just that the code exists.
- Say which survey types and roles a fact applies to.
- Start with what the user wants to do, then the steps. Use a numbered list for steps taken one after another, one action per step. Write a path through the UI as **A** > **B** > **C**.
- Keep it short. One way to do a thing is enough.
- Don't list what the user sees on the screen anyway, such as every button of a question or every column of a table. Explain only what isn't obvious from the screen.
- Say that something doesn't exist only where a reader would look for it, together with what to do instead. Don't collect such things in a list of their own.
- Give each fact one home, and link to it from other pages instead of repeating it.
- If the UI behaves wrongly, e.g. offers a button that fails, report it as a bug instead of documenting the workaround. If the guide must describe a workaround until the bug is fixed, add a comment saying when to remove it.
- Leave out edge cases that don't affect what the user does. The knowledge base has to cover everything, because the chatbot can't see the screen; the guide doesn't.

## Syntax

Plain Markdown: headings, paragraphs, lists, bold, italics and links. No images (screenshots go out of date with every UI change) and no tables.

- **UI labels**: `[[section:key]]` shows the label with that translation key in the user's language, in bold, e.g. `[[navBar:myCourses]]`. `[[section:key|fi]]` shows it in the given language. Use these for every button, tab and menu item, so the guide always matches the screen. Find keys in `public/locales/en/translation.json` (HY's own wording is in `hy.json`). Labels with a `{{placeholder}}` can't be used, as the guide has no value to fill it with.
- **Section ids**: `## Heading {#some-id}` gives a section an id to link to. Use the same id in both languages. Every `##` section needs one, as the menu lists them under the open page; keep their titles plain text.
- **Links** to guide pages: `[counter feedback](/guide/counter-feedback)`, or to a section: `(/guide/counter-feedback#send-email)`. Other links to Norppa start with `/` too, e.g. `/courses`. Links to other sites open in a new tab.
- **Bold** is for UI labels only, so the reader can tell what's on the screen. Use _italics_ for terms and emphasis.
- **Notes**: `> **Note:** ...` shows a highlighted box.
- **Videos**: `[[video:slug]]` on its own line shows the video recorded by `e2e/manual/scenarios/<slug>.manual.ts`, in the guide's language. In every language, put it after the steps it shows.
- **Comments**: `<!-- ... -->` are notes for editors and aren't shown.
