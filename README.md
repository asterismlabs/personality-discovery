# Personality and interest discovery

A static, client-side questionnaire. It scores a Big Five inventory and a vocational-interest checklist in the browser, then writes a prompt you can paste into any chat model. It does not call a model, and it does not send answers anywhere.

## Run it

```bash
pnpm install
pnpm dev
```

Production build:

```bash
pnpm build
pnpm preview
```

`pnpm build` writes a static `dist/` folder. `base` is relative (`./`), so the folder can be hosted at a domain root or in a subpath. After one online load, a service worker caches the app for offline use.

## Tests

```bash
pnpm test
pnpm test:e2e
```

`pnpm test` covers scoring, including reverse-keyed items, missing answers, and edge cases, plus a check that scoring and export do not call network APIs. `pnpm test:e2e` builds the app, checks the bundle for unexpected URLs, and walks the questionnaire in Chromium. The first end-to-end run needs browser binaries:

```bash
pnpm exec playwright install chromium
```

## What the scores mean

Levels are Low, Moderate, or High compared with the middle of that scale (below 37.5% of the maximum, between the cutoffs, or above 62.5%). They are not percentiles. No population norms are used.

Interest counts are the number of checked activities in each area, from 0 to 10, which is the paper form's own score. The Holland code lists the strongest areas and keeps ties visible. Ideas/data and people/things placements are this app's interpretation of those counts. They are not part of the O*NET Interest Profiler.

## Limitations

- Scores are not normed. A "High" result is high on the answer scale, not high compared with other people.
- Answers are self-report. Mood, self-image, and rushing can shift them. Effects of this kind are usually small to moderate.
- Results are tendencies. They are not a diagnosis, a prediction, or a substitute for career counseling or a clinical assessment.
- Each personality facet has four items, so facet scores are less stable than the domain scores.
- Work values are original and unvalidated. Work style is original, exploratory, and unvalidated.
- There is no ability test.
- The questionnaire is in English only.
- Nothing is uploaded. Saving progress is off until you opt in, and then it stays in this browser's local storage. "Clear all data" removes it.

## Privacy

There is no account and no analytics. The content-security policy does not allow connections except to the page's own origin (the app files and the offline cache). Attribution links are ordinary links. They are not fetched unless you open them.
