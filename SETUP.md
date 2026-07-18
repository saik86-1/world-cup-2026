# Get your World Cup predictor live — step by step

Goal: a real website at your own URL that **updates itself every day** with that
day's matches and predictions. You do the setup once; after that it runs on its
own. No coding needed for the live site — GitHub does the work in the cloud.

You will NOT need to keep any app open, and you will NOT paste a static file.

---

## Part A — Put it online (do this once, ~10 minutes)

### 1. Make a free GitHub account
Go to https://github.com and sign up (skip if you already have one).

### 2. Install Git on your Mac
Open the **Terminal** app (Cmd+Space, type "Terminal", Enter) and run:
```bash
git --version
```
If it prints a version, you're set. If it asks to install developer tools, click
**Install** and wait, then run it again.

### 3. Unzip the project
Double-click `world-cup-predictor.zip` (in your Downloads). You'll get a folder
called `world-cup-predictor`. Note where it is (e.g. `~/Downloads/world-cup-predictor`).

### 4. Create an empty repository on GitHub
On github.com click the **+** (top right) → **New repository**.
- Repository name: `world-cup-2026` (or anything)
- Leave it **Public**, do NOT add a README/gitignore (the project already has them)
- Click **Create repository**

Leave that page open — it shows your repo address, like
`https://github.com/yourname/world-cup-2026.git`.

### 5. Upload the project (copy–paste these in Terminal)
Replace the address in the 4th line with YOUR repo address from step 4.
```bash
cd ~/Downloads/world-cup-predictor
git init
git add .
git commit -m "World Cup 2026 predictor"
git branch -M main
git remote add origin https://github.com/yourname/world-cup-2026.git
git push -u origin main
```
The first push may pop up a GitHub login — sign in / authorize. Done when it
finishes without errors.

### 6. Turn on the website
On your repo page: **Settings** (top) → **Pages** (left menu) →
under **Build and deployment → Source**, choose **GitHub Actions**. That's it.

### 7. Watch it go live
Click the **Actions** tab. You'll see a run called "Predict & deploy" working
(yellow dot → green check, ~2 minutes). When it's green, your site is live at:
```
https://yourname.github.io/world-cup-2026/
```
Open it — the landing page shows the current matchday's fixtures and our
predictions.

**From now on it updates itself every day at 8am ET** — new day, new matches,
new predictions, automatically. Nothing for you to do.

---

## Part B — (Optional) Preview it on your own computer
Only if you want to run it locally. Needs **Node.js** (https://nodejs.org, the
"LTS" button). Then in Terminal:
```bash
cd ~/Downloads/world-cup-predictor/web
npm install
npm run dev
```
Open the link it prints (like http://localhost:5173).

---

## Part C — Logging a real result (the one manual touch)
Predictions appear automatically each day. To record what actually happened (so
the model scores itself and learns), edit `model/predict_day.py`, find
`RESULTS_OVERRIDE`, and add a line like:
```python
"2026-06-19-Spain-Morocco": {"home": 2, "away": 1},
```
Then commit and push:
```bash
cd ~/Downloads/world-cup-predictor
git add -A && git commit -m "log result" && git push
```
The site updates within a couple of minutes.

(If you'd rather not touch code at all, just ask me each day to log results and
regenerate — or have me extend the daily job to fetch final scores automatically.)

---

## If something looks stuck
- Actions tab shows a red X? Click it to see the step that failed — usually a
  typo in the repo address; re-check step 5.
- Site shows an old day? Open the **Actions** tab and click **Run workflow** on
  "Predict & deploy" to refresh immediately.
