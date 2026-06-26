# World Cup 2026 Daily Predictor

Predicts FIFA World Cup 2026 matches day by day with an **ensemble model
(Elo + Poisson + a neural net)**, scores each prediction against the real
result, and shows it all on an animated React website. Predictions start with
**France vs Senegal (16 June 2026)** and are made one match at a time.

## What's inside

```
world-cup-predictor/
├── model/                  Python prediction engine
│   ├── data_sources.py     team Elo ratings, confederations, flags, name aliases
│   ├── parse_txt.py        parser for openfootball text files (Euro/Copa/AFCON)
│   ├── build_corpus.py     builds the training corpus + 2026 schedule from the repos
│   ├── engine.py           Elo + Poisson + MLP ensemble
│   └── predict_day.py      the daily runner → writes data/*.json
├── data/                   generated JSON (read by the website)
└── web/                    Vite + React + TypeScript + Tailwind + Framer Motion site
```

## The model

- **Elo** — every team has a rating, seeded from published June-2026 World
  Football Elo values and updated after each result with a competition-weighted
  K-factor (World Cup / Euro / Copa / AFCON weighted highest, friendlies lowest).
- **Poisson** — the Elo gap (plus host-nation advantage for USA/Mexico/Canada)
  → expected goal supremacy → two Poisson distributions → scoreline matrix →
  win/draw/loss probabilities and the most-likely scoreline.
- **Neural net** — a multi-layer perceptron trained on **1,352 real matches**
  (every World Cup 1930–2022 + every Euro 1960–2024), with competition-importance
  and recency sample weighting.
- **Ensemble** — final probabilities = 62% Poisson + 38% neural net. The learned
  layer re-trains as 2026 results accumulate, so it sharpens over the tournament.

## Run the website

```bash
cd web
npm install
npm run dev        # open the printed localhost URL
# or: npm run build && npm run preview
```

## Make a prediction (the daily loop)

1. Refresh the 2026 source if needed: re-upload `worldcup.json-master/2026/worldcup.json`
   (it carries the real fixtures + results as they're played).
2. Rebuild the corpus + schedule, then predict:

```bash
cd model
python3 build_corpus.py          # parses the uploaded repos → data/training_matches.json, data/wc2026.json
# set TARGET_DATE (and ONLY = None to predict every fixture that day) in predict_day.py
python3 predict_day.py           # → data/predictions.json, accuracy.json, teams.json, matches.json
cp ../data/*.json ../web/src/data/   # refresh the site's data
```

`predict_day.py` automatically replays every played 2026 result into the live
Elo, scores any past prediction whose result is now known (updating the accuracy
record), and generates the new day's prediction.

## Data sources

- World Cup 1930–2022 — openfootball `worldcup.json`
- Euro 1960–2024 — openfootball `euro`
- Elo seeds — World Football Elo Ratings (June 2026)

## Notes & honesty

- Historical training uses each team's current rating as a strength proxy
  (standard practice; an approximation for older eras).
- Defunct/renamed sides are mapped to successors (West Germany→Germany,
  Soviet Union→Russia, Yugoslavia/Czechoslovakia→Serbia/Czech Republic, etc.).
- Predictions are probabilistic estimates for interest, not betting advice.

## Deploy as a live, auto-updating site (GitHub Pages)

The site is a normal Vite app, not a static HTML dump — once hosted it refreshes
itself. A GitHub Actions workflow (`.github/workflows/deploy.yml`) runs **every
day at 12:00 UTC** (and on every push): it regenerates that day's predictions,
commits the refreshed data so the archive/calendar persists, rebuilds the site,
and deploys to GitHub Pages. So a visitor on any future day sees that day's
fixtures and predictions automatically — no app open, no manual file.

One-time setup (needs your GitHub account — I can't push from here):

```bash
cd world-cup-predictor
git init && git add . && git commit -m "World Cup 2026 predictor"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

Then on GitHub: **Settings → Pages → Build and deployment → Source: GitHub
Actions**. The first deploy runs immediately; after that it self-updates daily.
Your live URL will be `https://<you>.github.io/<repo>/`.

The daily job only needs the committed `data/training_matches.json` and
`data/wc2026.json` (already in the repo) — it does not need the raw source
archives. Logging real match results still comes from `RESULTS_OVERRIDE` in
`model/predict_day.py` (or refreshing `data/wc2026.json`); predictions for each
day's fixtures generate automatically, but recording actual scores to keep the
accuracy record needs that result input.

