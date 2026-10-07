# User manual videos

Records user flows as videos with a cursor, captions, and an AI-generated voice. Scenarios are Playwright tests that seed made-up demo data (`demo.ts`, `users.ts`, `src/server/test/manual/`).

## Running

```bash
npm run manual:setup               # the app (port 8000) and the voice service
npm run manual:record              # every scenario
npm run manual:record -- opiskelija # scenarios whose file name matches
```

Videos go to `videos/<lang>/<scenario>.mp4` + `.vtt` (gitignored). Without `ffmpeg` you get `.webm`. Failed scenarios write nothing there, see `test-results/manual/`.

The app is a production build, so it looks like production, but its server is not in production mode: mail is only logged and nothing connects to production services. The test fails if the browser requests anything outside the app, except the font.

## Writing a scenario

Add `scenarios/<name>.manual.ts`. One file is one video.

```ts
manualTest('Otsikko', async ({ page, demo, loginAs, caption, click, fill }) => {
  await demo.seed('ongoing')
  await loginAs(teacher)

  await caption({ fi: 'Mitä seuraavaksi tapahtuu.' })
  await click(byDataCy(page, 'some-button'))
  await fill(page.locator('#some-input'), 'kirjoitettava teksti')
})
```

- `caption(text, minMs?)` shows the text and plays its narration.
- `click` / `fill` move the cursor to the element first, `fill` types character by character.
- `scrollTo(locator)` scrolls smoothly, `pause(ms?)` waits.
- `demo.seed(stage, { feedback })` replaces all data with the demo course at that stage. Pick the stage where a user would meet the feature.
- `steps.ts` has shared steps.
- End with an `expect`, so a broken scenario fails instead of recording a wrong video.

## Languages

Captions are `{ fi, sv?, en? }` and each language is a project in `playwright.manual.config.ts`. Only `fi` is enabled. Missing captions fall back to Finnish.

## Narration

The voice is [Chatterbox Multilingual](https://github.com/resemble-ai/chatterbox) (MIT), running on CPU in `tts/` with pinned weights baked into the image. It watermarks every clip inaudibly.

- `manual:record` first runs the scenarios without video to generate the clips, then records, so generation never freezes the video.
- Clips are cached in `.narration-cache/` by model, voice, language and text. Generation is seeded, so a regenerated clip sounds the same.
- A full run without filters deletes clips that have not been used for a week.
- The voice is set in `GENERATE_OPTIONS` in `tts/server.py`.
- Without the service (`MANUAL_TTS_URL`) videos are recorded silently with a warning.
- `MANUAL_VOICE=<name>` uses `tts/voices/<name>.wav`, see `tts/voices/README.md` for consent.

### Updating the packages

To update packages, run `uv lock --upgrade` in `tts/`. The direct dependencies are pinned to exact versions in `tts/pyproject.toml`.
