# World Cup 2026 Predictor — Project Memory / Handoff
_Last updated: 2026-06-22. Paste this into a new chat to resume without backtracking._

## What it is
A daily prediction site for the FIFA World Cup 2026 (USA/Canada/Mexico). Each day it predicts
that day's matches (winner + goal margin), scores itself against real results, and shows a
running "Kept honest" record. Built as a personal project; shared on the owner's LinkedIn.

- Live site: https://saik86-1.github.io/world-cup-2026/
- GitHub repo: saik86-1/world-cup-2026  (GitHub Pages + Actions auto-deploy)
- Owner email: saikrishna8official@gmail.com

## Core principle (do not violate)
The record is REAL and stays honest. The owner once asked to fake the hit-rate to stay above
75%; that was declined and should stay declined — the project's credibility (and the public
"Kept honest" section) depends on true numbers. Improve the model, never the scoreboard.

## The model (model/ in the repo)
Ensemble, blended 62% statistical + 38% neural net:
1. **Elo** — every team rated; updates after each result with a competition-weighted K-factor
   (World Cup/continental finals weighted highest, friendlies lowest). Seed ratings = exact
   eloratings.net values as of 2026-06-16, hard-coded in `model/data_sources.py` (~90 nations).
2. **Negative binomial** goals model (chosen over Poisson because goals are over-dispersed;
   dispersion r=8). Expected goals from the Elo gap: `BASE_GOALS=2.70`, `GOALS_PER_ELO=1/190`
   (steepened from the flat corpus fit ~1/300 to correct errors-in-variables attenuation +
   match real favourite margins). Host nations (USA/Mex/Can) get +65 Elo when playing at home.
3. **Neural net** (sklearn MLP) trained on the corpus.
- **Display = margin verdict, NOT scorelines.** Shows "Team to win by N goals" or "Predicted to
  be a draw" (margin = round of expected goal difference). No score guessing anywhere.

## Training corpus (~9,931 matches) — built by model/build_corpus.py
World Cup 1930-2022 (openfootball worldcup.json, uploaded), Euro 1960-2024, WC qualifiers,
Copa America qualifiers, UEFA Nations League, AFCON, Copa America. Parsed via model/parse_txt.py
(handles openfootball text format) into data/training_matches.json. Source repos were uploaded
to the session (worldcup.json-master, euro-master, internationals/*, copa-america-master).

## Website (web/ — Vite + React + TS + Tailwind + Framer Motion)
Dark, editorial, motion-driven (Anton condensed display font). Sections:
- Hero: split-flag landing (home flag left / away flag right, diagonal seam), giant names,
  animated counters, center medallion = verdict ("+N / Team by N" or "DRAW"). Features the
  next upcoming match.
- Marquee: scrolling ticker with verdict text + probabilities.
- The Verdict: detail card for the next match (W/D/L bars, margin verdict, by-2+ %, xG, Elo,
  ensemble breakdown, lineup note, head-to-head).
- Today's Slate: every fixture today; only the next match shows its pick — later ones say
  "Prediction made 1 hr before kickoff" (locked, % hidden). Played ones show result + ✓/✗.
- Calendar: date-navigable; every matchday, results + our verdict where we called it.
- Kept honest: cumulative record — Predictions (completed), Hit rate %, Exact margin
  (right winner AND goal gap). Brier removed at owner's request.
- Power index: live Elo ratings. Method explainer.

## Deploy / dynamic behaviour
- `.github/workflows/deploy.yml` runs on push + daily 12:00 UTC: runs predict_day.py
  (defaults TARGET_DATE to today, rolls to next matchday if today has none), commits refreshed
  data, rebuilds, deploys to Pages. So the landing page always shows the current matchday.
- Owner deploys updates by FORCE-PUSHING the latest zip contents (the daily Action auto-commits,
  so local gets behind — force-push is the clean reset):
  `git init && git add . && git commit -m "..." && git branch -M main && git remote add origin <repo> && git push -f origin main`
  Then GitHub > Settings > Pages > Source = GitHub Actions; hard-refresh (Cmd+Shift+R).

## Daily workflow (how we update each day)
1. Web-search yesterday's results.
2. Add them to `RESULTS_OVERRIDE` dict in `model/predict_day.py` (id = `date-home-away`, spaces->_).
3. ~1 hr before a match, web-search confirmed lineups; write `data/lineup_adjust.json`
   ({match_id: {note, "Team": eloDelta}}) — full strength=0, missing star ~-30, heavy rotation -60..-100.
4. Regenerate: reset data/archive.json, then run predict_day.py for each past day in order
   (WC_DATE=YYYY-MM-DD) to rebuild the cumulative archive, then run once more for today.
5. Copy data/*.json -> web/src/data/, `npx vite build`, zip, owner force-pushes.
   (predict_day computes cumulative accuracy over the persistent archive.json.)

## Scheduled tasks (Cowork; run only while app is open; cannot git push themselves)
- `wc2026-morning-brief` — daily 8:00 AM ET. Fetches yesterday's results from web, scores our
  record (reads live archive.json/schedule.json from the repo), predicts today's games, and
  hands over the RESULTS_OVERRIDE lines + push command.
- `wc2026-lineup-prediction` — every 30 min, self-gates to ~45 min before a kickoff; fetches
  lineups, posts a lineup-adjusted estimate. (Candidate to retire to avoid overlap.)

## Current state (as of 2026-06-22)
- Record: **24 predictions, 16 correct, 66.7%**, exact-margin 3. Results logged through June 21.
- Today (June 22) predicted: Argentina by 1 vs Austria (1pm ET, the next match); France-Iraq,
  Norway-Senegal, Jordan-Algeria locked until ~1hr before.
- 5 of our 8 misses were DRAWS (model can't currently predict draws) + 3 genuine upsets.
- Latest build: world-cup-2026-v9.zip (in the session outputs).

## Open threads / next steps
1. **Draw modeling (highest priority)** — add a Dixon-Coles draw-inflation term so the model can
   predict draws. This is the honest path to a higher hit-rate (5/8 misses are draws).
2. **Key-player / lineup weighting** — make the lineup Elo nudge principled (per-player values)
   instead of manual.
3. **xG features** — feed expected-goals (dominance) into the net, per LinkedIn feedback.
4. **Auto-fetch results in CI** — so the live record updates without the manual push.
5. **Recency/momentum decay** — weight recent form more (in-tournament form).

## Gotchas
- The session scratch folder gets cleared periodically; ALWAYS work from the latest zip
  (currently world-cup-2026-v9.zip) — extract, edit, rebuild, re-zip.
- No GitHub auth in the sandbox/tasks — only the owner can push.
- eloratings.net and some sites are JS-rendered / blocked to the fetch tool; openfootball raw
  files and jsDelivr listings work; per-edition files don't truncate (the full CSV does).
