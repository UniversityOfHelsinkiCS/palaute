# User manual videos

Records user flows as videos with a cursor, captions, and an AI-generated voice. Scenarios are Playwright tests that seed made-up demo data (`demo.ts`, `users.ts`, `src/server/test/manual/`).

## Running

```bash
npm run manual:setup               # the app (port 8000) and the voice service
npm run manual:record              # every scenario
npm run manual:record -- feedback   # scenarios whose file name matches
```

Videos go to `public/manual/<lang>/<scenario>.mp4` (gitignored), so the dev server serves them at `/manual/<lang>/<scenario>.mp4`. Without `ffmpeg` you get `.webm`. Failed scenarios write nothing there, see `test-results/manual/`.

`public/manual/<lang>/index.json` lists the videos with title, URL, duration and captions.

The app is a production build, so it looks like production, but its server is not in production mode: mail is only logged and nothing connects to production services. The test fails if the browser requests anything outside the app, except the font.

## Writing a scenario

Add `scenarios/<slug>.manual.ts`. One file is one video, shown in the user guide with `[[video:<slug>]]`, so name it after the guide section it shows.

```ts
manualTest(
  'Otsikko',
  { annotation: { type: 'en', description: 'Title' } },
  async ({ page, demo, loginAs, caption, click, fill, t, localize }) => {
    await demo.seed('ongoing')
    await loginAs(teacher)

    await caption({
      fi: 'Mitä seuraavaksi tapahtuu.',
      en: 'What happens next.',
    })
    await click(page.getByRole('button', { name: t('common:save') }))
    await fill(page.locator('#some-input'), localize({ fi: 'kirjoitettava teksti', en: 'text to type' }))
  }
)
```

- `caption(text, minMs?)` shows the text and plays its narration.
- `click` / `fill` move the cursor to the element first, `fill` types character by character.
- `hover(locator)` points at an element without clicking, to show what a caption is about.
- `scrollTo(locator)` scrolls smoothly, `pause(ms?)` waits.
- `demo.seed(stage, { feedback })` replaces all data with the demo course at that stage. Pick the stage where a user would meet the feature.
- The server and the browser run from `NOW` in `demo.ts`, not the real date, so a video is the same whenever it is recorded. Compute dates from the ones `demo.seed` returns, never from `new Date()`.
- `t(key)` is a UI label in the video's language, `localize(text)` picks the text to type.
- `steps.ts` has shared steps.
- End with an `expect`, so a broken scenario fails instead of recording a wrong video.

## Languages

Captions are `{ fi, sv?, en? }` and each language is a project in `playwright.manual.config.ts`: `fi` and `en`. Missing captions fall back to Finnish. The title is in Finnish, other languages are annotations.

## Narration

The voice is the shared [guide-video-voice](https://github.com/UniversityOfHelsinkiCS/guide-video-voice) image. Pulling it needs `docker login registry.version.helsinki.fi`.

- `manual:record` first runs the scenarios without video to generate the clips, then records, so generation never freezes the video.
- Clips are cached as Opus in `.narration-cache/` by the voice's version, voice, language and text. Generation is seeded, so a regenerated clip sounds the same.
- The voice's version is its image tag in `docker-compose.manual.yml`. A new version generates every clip again.
- A full run without filters deletes clips that have not been used for a week.
- Abbreviations the voice reads as words, like XLSX, are spelled out in `SPELLED_OUT` in `narration.ts`.
- Without the service (`MANUAL_TTS_URL`) only cached clips are used, the rest is silent with a warning.
- `MANUAL_VOICE=<name>` uses another voice in the image.

## CI

`.github/workflows/manual-videos.yml` records the videos on every push to master, one run at a time. It doesn't hold up the deploy, a failed video only fails the run.

- When every video passed on master, they're pushed to the registry as `norppa-manual-videos:latest`.
- Staging and releases build with the newest videos, the build's summary tells which commit they're from. To release new videos, wait for their run to pass.
- The scenarios are split across the runners of the `record` matrix (`--shard`), which start the voice service only if clips are missing. A new voice version generates them all again.
- The clips are kept in the registry as `norppa-manual-narration:latest` (ORAS). They're saved after every run; unused ones are dropped only when every shard of a first attempt passed on master.
- When every shard passes, the videos and their `index.json` files are merged.
- A caption without a clip fails the recording.
