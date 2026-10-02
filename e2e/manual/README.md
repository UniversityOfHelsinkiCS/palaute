# User manual videos

Records user flows as videos with a cursor, captions, an AI-generated voice and a WebVTT subtitle file. Scenarios are Playwright tests on the e2e fixtures, so they reset and seed the database like the e2e tests.

## Running

```bash
npm run manual:setup               # the e2e app (port 3000) and the voice service
npm run manual:record              # every scenario
npm run manual:record -- opiskelija # scenarios whose file name matches
```

Videos go to `videos/<lang>/<scenario>.mp4` + `.vtt` (gitignored). Without `ffmpeg` you get `.webm`. Failed scenarios write nothing there, see `test-results/manual/`.

## Writing a scenario

Add `scenarios/<name>.manual.ts`. One file is one video.

```ts
manualTest('Otsikko', async ({ page, api, loginAs, caption, click, fill }) => {
  await api.createFeedbackTarget()
  await loginAs(teacher)

  await caption({ fi: 'Mitä seuraavaksi tapahtuu.' })
  await click(byDataCy(page, 'some-button'))
  await fill(page.locator('#some-input'), 'kirjoitettava teksti')
})
```

- `caption(text, minMs?)` shows the text, adds a subtitle cue and plays its narration.
- `click` / `fill` move the cursor to the element first, `fill` types character by character.
- `scrollTo(locator)` scrolls smoothly, `pause(ms?)` waits.
- `steps.ts` has shared steps. Seed the course so it is on the My surveys tab a user would expect.
- End with an `expect`, so a broken scenario fails instead of recording a wrong video.

## Languages

Captions are `{ fi, sv?, en? }` and each language is a project in `playwright.manual.config.ts`. Only `fi` is enabled. Missing captions fall back to Finnish.

## Narration

The voice is [Chatterbox Multilingual](https://github.com/resemble-ai/chatterbox) (MIT), running on CPU in `tts/` with pinned weights baked into the image. It watermarks every clip inaudibly.

- `manual:record` first runs the scenarios without video to generate the clips, then records, so generation never freezes the video.
- Clips are cached in `.narration-cache/` by model, voice, language and text. Generation is seeded, so a regenerated clip sounds the same.
- The voice is set in `GENERATE_OPTIONS` in `tts/server.py`.
- Without the service (`MANUAL_TTS_URL`) videos are recorded silently with a warning.
- `MANUAL_VOICE=<name>` uses `tts/voices/<name>.wav`, see `tts/voices/README.md` for consent.

### Updating the packages

To update packages, run `uv lock --upgrade` in `tts/`. The direct dependencies are pinned to exact versions in `tts/pyproject.toml`.
