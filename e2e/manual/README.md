# User manual videos

Records short videos of real user flows for the user manual. The videos show a visible cursor and a caption bar, and each one comes with a WebVTT subtitle file. Scenarios are regular Playwright tests built on the e2e fixtures (`e2e/support/test.ts`), so they reset and seed the database the same way the e2e tests do.

## Running

Start the app in e2e mode (`npm run test:setuplocal`, port 3000), then:

```bash
npm run manual:record              # every scenario
npm run manual:record -- opiskelija # scenarios whose file name matches
```

The output goes to `videos/<lang>/<scenario>.mp4` + `.vtt` and is gitignored. `ffmpeg` is needed for mp4; without it you get the `.webm`. Recording is headless, so you can keep working while it runs. A failed scenario writes nothing here, and Playwright's own video and trace go to `test-results/manual/`.

## Writing a scenario

Add `scenarios/<name>.manual.ts`. One file is one video, named after the file.

```ts
manualTest('Otsikko', async ({ page, api, loginAs, caption, click, fill }) => {
  await api.createFeedbackTarget()
  await loginAs(teacher)

  await caption({ fi: 'Mitä seuraavaksi tapahtuu.' })
  await click(byDataCy(page, 'some-button'))
  await fill(page.locator('#some-input'), 'kirjoitettava teksti')
})
```

- `caption(text, minMs?)` shows the text, adds a subtitle cue and waits long enough to read it. The caption stays visible across page loads.
- `click` / `fill` move the cursor to the element before acting. `fill` types character by character.
- `pause(ms?)` waits without changing the caption.
- Prefer `data-cy` selectors. Visible texts and some `data-cy` values (e.g. `navbar-link-*`) change with the UI language.
- End with an `expect` on the final state, so a broken scenario fails instead of recording a wrong video.

## Languages

Captions are `{ fi, sv?, en? }`. Each language is a project in `playwright.manual.config.ts`. The `lang` option seeds the users with that language, so the UI follows it. Only `fi` is enabled for now. To add another language, write its captions and add a project. Missing captions fall back to Finnish with a warning. The seed data's Swedish names are placeholders, so fix those before recording in Swedish.

## Voice-over (not yet implemented)

The subtitle cues already hold the narration script with timestamps. To add voice-over:

- Generate a clip per caption before recording, with Piper or a trained voice.
- Use each clip's length as that caption's wait instead of `captionDuration` in `fixtures.ts`.
- Mix the clips into the mp4 with ffmpeg (`adelay` + `amix`).
